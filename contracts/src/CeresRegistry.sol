// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @notice Interface for CeresDID (superset of IERC721 + profile + utility).
interface ICeresDID is IERC721 {
    function mint(address to) external returns (uint256);
    function updateProfile(
        uint256 tokenId,
        string calldata name,
        string calldata bio,
        string calldata avatar,
        string[] calldata urls
    ) external;
    function totalSupply() external view returns (uint256);
}

/// @title CeresRegistry
/// @notice Registry for Ceres DID profiles. Manages invite relationships,
///         descendant counts, and level tiers.
contract CeresRegistry is Ownable {
    // ───── State ─────

    /// @notice The CeresDID ERC-721 contract.
    ICeresDID public immutable didContract;

    /// @notice tokenId → inviter tokenId (0 = genesis / no inviter).
    mapping(uint256 => uint256) public inviterOf;

    /// @notice tokenId → directly invited tokenIds.
    mapping(uint256 => uint256[]) private _directInvitees;

    /// @notice tokenId → total descendant count (cached, incrementally updated).
    mapping(uint256 => uint256) public descendantCount;

    /// @notice Address → tokenId (each address can only have one DID).
    mapping(address => uint256) public tokenOf;

    /// @notice Fee to mint a DID profile.
    uint256 public mintFee = 0.001 ether;

    /// @notice Whether mint fee is enabled.
    bool public mintFeeEnabled = false;

    // ───── Events ─────

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    event ProfileCreated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed inviterTokenId
    );

    event DIDTransferred(uint256 indexed tokenId, address from, address to);
    event MintFeeUpdated(uint256 newFee);
    event MintFeeToggled(bool enabled);
    event FeesWithdrawn(address to, uint256 amount);

    // ───── Errors ─────
    error NotDIDContract();
    error InviterDoesNotExist();
    error SelfInvite();
    error NameRequired();
    error AlreadyHasDID();
    error TooManyURLs(uint256 count, uint256 max);

    // ───── Constructor ─────

    constructor(address _didContract) Ownable(msg.sender) {
        require(_didContract != address(0), "Registry: zero DID address");
        didContract = ICeresDID(_didContract);
    }

    // ───── Profile Creation ─────

    /// @notice Create a new Ceres profile (mint DID + record invite + set profile).
    /// @param name Display name (required).
    /// @param bio Short bio.
    /// @param avatar Profile photo URL (IPFS or HTTPS).
    /// @param urls Social links / websites.
    /// @param inviterTokenId Token ID of the inviter (0 for genesis).
    /// @return tokenId The newly minted DID token ID.
    function createProfile(
        string calldata name,
        string calldata bio,
        string calldata avatar,
        string[] calldata urls,
        uint256 inviterTokenId
    ) external payable returns (uint256) {
        // Mint fee check
        if (mintFeeEnabled) {
            require(msg.value >= mintFee, "Insufficient mint fee");
        }

        // Basic sanity
        if (bytes(name).length == 0) revert NameRequired();
        if (urls.length > 20) revert TooManyURLs(urls.length, 20);

        // One DID per address
        if (didContract.balanceOf(msg.sender) > 0) revert AlreadyHasDID();

        // Validate inviter (if provided)
        if (inviterTokenId > 0) {
            // Must exist
            try didContract.ownerOf(inviterTokenId) returns (address inviterOwner) {
                if (inviterOwner == address(0)) revert InviterDoesNotExist();
            } catch {
                revert InviterDoesNotExist();
            }
            // Cannot invite the token that will be minted this tx
            // (safe guard — tokenIds are sequential; next is totalSupply+1)
            if (inviterTokenId == didContract.totalSupply() + 1) revert SelfInvite();
        }

        // Mint DID NFT
        uint256 tokenId = didContract.mint(msg.sender);
        tokenOf[msg.sender] = tokenId;

        // Record invite relationship
        if (inviterTokenId > 0) {
            inviterOf[tokenId] = inviterTokenId;
            _directInvitees[inviterTokenId].push(tokenId);
            _updateDescendantCounts(inviterTokenId, 1);
        }

        // Set initial profile via DID contract
        didContract.updateProfile(tokenId, name, bio, avatar, urls);

        emit Transfer(address(0), msg.sender, tokenId);
        emit ProfileCreated(tokenId, msg.sender, inviterTokenId);
        return tokenId;
    }

    // ───── DID Transfer Callback ─────

    /// @notice Called by CeresDID after every NFT transfer.
    ///         Invite relationships remain with the token, not the address.
    function onDIDTransfer(uint256 tokenId, address from, address to) external {
        if (msg.sender != address(didContract)) revert NotDIDContract();

        if (from != address(0) && to != address(0) && from != to) {
            emit DIDTransferred(tokenId, from, to);
        }
    }

    // ───── View: Direct Invitees ─────

    /// @notice Get the list of tokens directly invited by `tokenId`.
    function getDirectInvitees(uint256 tokenId)
        external
        view
        returns (uint256[] memory)
    {
        return _directInvitees[tokenId];
    }

    /// @notice Get the immediate inviter (parent) of a token.
    function getInviter(uint256 tokenId) external view returns (uint256) {
        return inviterOf[tokenId];
    }

    // ───── View: Ancestors ─────

    /// @notice Walk up the invite chain up to `maxDepth` levels.
    /// @return ancestors Array of ancestor tokenIds, starting from direct parent.
    function getAncestors(uint256 tokenId, uint256 maxDepth)
        external
        view
        returns (uint256[] memory ancestors)
    {
        ancestors = new uint256[](maxDepth);
        uint256 count;
        uint256 current = tokenId;

        for (uint256 i = 0; i < maxDepth; i++) {
            uint256 parent = inviterOf[current];
            if (parent == 0) break;
            ancestors[count] = parent;
            count++;
            current = parent;
        }

        // Trim to actual count
        assembly {
            mstore(ancestors, count)
        }
    }

    // ───── View: Descendant Count ─────

    /// @notice Get the cached total descendant count for a token.
    function getDescendantCount(uint256 tokenId) external view returns (uint256) {
        return descendantCount[tokenId];
    }

    // ───── View: Level ─────

    /// @notice Compute the level tier based on descendant count.
    function getLevel(uint256 tokenId) public view returns (uint8) {
        uint256 dc = descendantCount[tokenId];
        if (dc >= 1000) return 5; // 🌟 Diamond
        if (dc >= 200)  return 4; // 💎 Crystal
        if (dc >= 50)   return 3; // 🥇 Gold
        if (dc >= 10)   return 2; // 🥈 Silver
        if (dc >= 1)    return 1; // 🥉 Bronze
        return 0;                  // 🌱 Seed
    }

    /// @notice Get the human-readable level name.
    function getLevelName(uint8 lvl) external pure returns (string memory) {
        if (lvl == 5) return "Diamond";
        if (lvl == 4) return "Crystal";
        if (lvl == 3) return "Gold";
        if (lvl == 2) return "Silver";
        if (lvl == 1) return "Bronze";
        return "Seed";
    }

    // ───── View: Utilities ─────

    function totalProfiles() external view returns (uint256) {
        return didContract.totalSupply();
    }

    // ───── Internal ─────

    // ───── Owner: Fee Management ─────

    function setMintFee(uint256 _fee) external onlyOwner {
        mintFee = _fee;
        emit MintFeeUpdated(_fee);
    }

    function toggleMintFee(bool _enabled) external onlyOwner {
        mintFeeEnabled = _enabled;
        emit MintFeeToggled(_enabled);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
        emit FeesWithdrawn(owner(), balance);
    }

    // ───── Internal ─────

    /// @dev Walk up the invite chain and increment descendant counts.
    function _updateDescendantCounts(uint256 tokenId, uint256 delta) internal {
        uint256 current = tokenId;
        while (current > 0) {
            unchecked {
                // Overflow-safe: descendantCount starts at 0 and is only incremented
                // with small deltas (1 per new invitee). A uint256 cannot overflow in
                // practice within Ethereum's lifetime.
                descendantCount[current] += delta;
            }
            current = inviterOf[current];
        }
    }
}
