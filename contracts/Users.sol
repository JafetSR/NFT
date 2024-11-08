pragma solidity >= 0.8.0 < 0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Users is Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _userIds;
    struct StructUser{
        string firstName;
        string lastName;
        uint256 amountSpent;
        uint256 userId;
    }
    mapping (uint256 => StructUser) public users;

    function insertUser(string memory firstName, string memory lastName) public onlyOwner returns (uint256) {
        _userIds.increment();
        uint256 newUserID = _userIds.current();
        StructUser memory newUser = StructUser(firstName, lastName, 0, newUserID);
        users[newUserID] = newUser;
        return newUserID;
    }

    function getUser() public view returns (StructUser[] memory) {
        StructUser[] memory usersArray = new StructUser[](_userIds.current());
        for (uint256 i = 0; i < _userIds.current(); i++) {
            StructUser storage user = users[i + 1];
            usersArray[i] = user;
        }
        return usersArray;
    }

    function getUserByID(uint256 userID) public view returns (StructUser memory) {
        return users[userID];
    }

    function registerSale(uint256 userID, uint256 amount) public onlyOwner {
        users[userID].amountSpent += amount;
    }
}