pragma solidity >= 0.0.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTClase is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using Strings for uint256;

    // Estructura de NFTs para almacenarlos luego en un array
    struct NFTItem {
        uint256 tokenId;
        string tokenURI;
    }

    mapping(uint256 => NFTItem) private _idToNftItem;

    mapping (uint256 => string) private _tokenURIs;
    constructor() ERC721("NFTCLASE", "NFTCLASE"){}
    string private _baseURIextended;
    mapping(address => mapping(uint => uint)) private _ownedTokens;

    function setBaseUri(string memory baseUri) external onlyOwner() {
        _baseURIextended = baseUri;
    }
    function _setTokenUri(uint256 tokenId, string memory _tokenURI) internal virtual{
        require(_exists(tokenId), "ERC721Meta: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query of nonexistent token");
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function mintNFT(address recipient, string memory _tokenURI) public onlyOwner returns(uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenUri(newItemId, _tokenURI);

        // Guardar los detalles del NFT
        _idToNftItem[newItemId] = NFTItem({
            tokenId: newItemId,
            tokenURI: _tokenURI
        });

        // Actualizar el mapeo de tokens poseídos
        uint index = ERC721.balanceOf(recipient) - 1;
        _ownedTokens[recipient][index] = newItemId;

        return newItemId;
    }

    function getOwnedNfts(address user) public view returns(NFTItem[] memory) {
        uint ownedItemsCount = ERC721.balanceOf(user);
        NFTItem[] memory items = new NFTItem[](ownedItemsCount);
        for (uint256 i = 0; i < ownedItemsCount; i++) {
            uint tokenId = tokenOwnerByIndex(user, i);
            NFTItem storage item = _idToNftItem[tokenId];
            items[i] = item;
        }
        return items;
    }

    function tokenOwnerByIndex(address owner, uint index) public view returns(uint) {
        require(index<ERC721.balanceOf(owner), "Index out of bounds.");
        return _ownedTokens[owner][index];
    }
}