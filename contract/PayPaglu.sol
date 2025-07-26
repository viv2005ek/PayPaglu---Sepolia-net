// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PayPaglu - Web3 Remittance App
 * @dev Allows P2P payments via usernames/phone numbers, family vaults, and transaction history
 * @dev Designed for Morph Holesky testnet
 */
contract PayPaglu is ReentrancyGuard {
    // User details struct
    struct User {
        string username;
        string phoneNumber;
        address walletAddress;
        bool exists;
    }

    // Family Vault struct
    struct FamilyVault {
        address creator;
        address[] members;
        uint256 balance;
        mapping(address => bool) isMember;
    }

    // Transaction history struct
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 gasUsed;
        uint256 timestamp;
        string method; // "send", "vault_deposit", "vault_withdraw"
    }

    // Mappings
    mapping(string => address) private usernameToAddress;
    mapping(string => address) private phoneToAddress;
    mapping(address => User) private addressToUser;
    mapping(address => Transaction[]) private userTransactions;
    mapping(address => FamilyVault) private userToVault;
    mapping(address => address[]) private userToVaults;

    // Events
    event UserRegistered(address indexed user, string username, string phoneNumber);
    event FundsSent(address indexed sender, address indexed receiver, uint256 amount, uint256 gasUsed);
    event VaultCreated(address indexed creator);
    event VaultDeposit(address indexed member, uint256 amount);
    event VaultWithdraw(address indexed member, uint256 amount);
    event MemberAdded(address indexed vaultCreator, address indexed newMember);

    // Modifiers
    modifier onlyNewUser() {
        require(!addressToUser[msg.sender].exists, "User already registered");
        _;
    }

    modifier onlyVaultMember(address vaultCreator) {
        require(userToVault[vaultCreator].isMember[msg.sender], "Not a vault member");
        _;
    }

   modifier onlyVaultCreator(address vaultCreator) {
        require(userToVault[vaultCreator].creator == msg.sender, "Only vault creator");
        _;
    }

    /**
     * @dev Register a new user with unique username and phone number
     * @param _username Minimum 3 chars
     * @param _phoneNumber Minimum 5 chars
     */
    function registerUser(string calldata _username, string calldata _phoneNumber) 
        external 
        onlyNewUser 
    {
        require(bytes(_username).length >= 3, "Username too short");
        require(bytes(_phoneNumber).length >= 5, "Invalid phone number");
        require(usernameToAddress[_username] == address(0), "Username taken");
        require(phoneToAddress[_phoneNumber] == address(0), "Phone number taken");

        User memory newUser = User(_username, _phoneNumber, msg.sender, true);
        addressToUser[msg.sender] = newUser;
        usernameToAddress[_username] = msg.sender;
        phoneToAddress[_phoneNumber] = msg.sender;

        emit UserRegistered(msg.sender, _username, _phoneNumber);
    }

    /**
     * @dev Send funds via username, phone, or direct address
     * @param _identifier Username or phone number (leave empty for direct address)
     * @param _directAddress Fallback if identifier not found
     * @param _amount ETH amount in wei
     * @param _gasUsed Estimated gas for frontend display
     */
    function sendFunds(
        string calldata _identifier,
        address _directAddress,
        uint256 _amount,
        uint256 _gasUsed
    ) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value == _amount, "Amount mismatch");
        require(_amount > 0, "Amount must be > 0");

        address receiver = _findReceiver(_identifier, _directAddress);
        require(receiver != address(0), "Receiver not found");
        require(receiver != msg.sender, "Cannot send to self");

        (bool sent, ) = receiver.call{value: _amount}("");
        require(sent, "Transfer failed");

        _logTransaction(msg.sender, receiver, _amount, _gasUsed, "send");
        emit FundsSent(msg.sender, receiver, _amount, _gasUsed);
    }

    // ================== FAMILY VAULT FUNCTIONS ================== //
 function createVault() external {
    require(userToVault[msg.sender].creator == address(0), "Vault exists");
    FamilyVault storage vault = userToVault[msg.sender];
    vault.creator = msg.sender;
    vault.members.push(msg.sender);
    vault.isMember[msg.sender] = true;
    userToVaults[msg.sender].push(msg.sender); // Add this line
    emit VaultCreated(msg.sender);
}

    /**
     * @dev Add a new member to a specified vault
     * @param _vaultCreator The address of the vault creator
     * @param _newMember The address of the new member to add
     */
function addToVault(address _vaultCreator, address _newMember) 
    external 
    onlyVaultCreator(_vaultCreator) 
{
    FamilyVault storage vault = userToVault[_vaultCreator];
    require(!vault.isMember[_newMember], "Already member");
    require(_newMember != address(0), "Invalid address");

    vault.members.push(_newMember);
    vault.isMember[_newMember] = true;
    userToVaults[_newMember].push(_vaultCreator); // This is correct
    emit MemberAdded(_vaultCreator, _newMember);
}

function getVaultsForMember(address _member) external view returns (address[] memory) {
    return userToVaults[_member];
}

    function depositToVault(address _vaultCreator) 
        external 
        payable 
        onlyVaultMember(_vaultCreator)
        nonReentrant
    {
        require(msg.value > 0, "Amount must be > 0");
        FamilyVault storage vault = userToVault[_vaultCreator];
        vault.balance += msg.value;
        
        _logTransaction(
            msg.sender,
            _vaultCreator,
            msg.value,
            gasleft(),
            "vault_deposit"
        );
        emit VaultDeposit(msg.sender, msg.value);
    }

    function withdrawFromVault(address _vaultCreator, uint256 _amount) 
        external 
        onlyVaultMember(_vaultCreator)
        nonReentrant
    {
        FamilyVault storage vault = userToVault[_vaultCreator];
        require(vault.balance >= _amount, "Insufficient vault balance");
        require(_amount > 0, "Amount must be > 0");
        
        vault.balance -= _amount;
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        
        _logTransaction(
            _vaultCreator,
            msg.sender,
            _amount,
            gasleft(),
            "vault_withdraw"
        );
        emit VaultWithdraw(msg.sender, _amount);
    }

     function canWithdraw(address _vaultCreator, address _member, uint256 _amount) 
        external 
        view 
        returns (bool) 
    {
        FamilyVault storage vault = userToVault[_vaultCreator];
        return vault.isMember[_member] && vault.balance >= _amount;
    }

    // ================== HELPER FUNCTIONS ================== //
    function _findReceiver(string calldata _identifier, address _directAddress) 
        private 
        view 
        returns (address) 
    {
        if (bytes(_identifier).length > 0) {
            address byUsername = usernameToAddress[_identifier];
            if (byUsername != address(0)) return byUsername;
            
            address byPhone = phoneToAddress[_identifier];
            if (byPhone != address(0)) return byPhone;
        }
        return _directAddress;
    }

    function _logTransaction(
        address _sender,
        address _receiver,
        uint256 _amount,
        uint256 _gasUsed,
        string memory _method
    ) private {
        userTransactions[_sender].push(Transaction(
            _sender,
            _receiver,
            _amount,
            _gasUsed,
            block.timestamp,
            _method
        ));
        userTransactions[_receiver].push(Transaction(
            _sender,
            _receiver,
            _amount,
            _gasUsed,
            block.timestamp,
            _method
        ));
    }

    // ================== VIEW FUNCTIONS ================== //
    function getUser(address _user) external view returns (User memory) {
        return addressToUser[_user];
    }

    function getVaultMembers(address _vaultCreator) external view returns (address[] memory) {
        return userToVault[_vaultCreator].members;
    }

  function getVaultBalance(address _vaultCreator) external view returns (uint256) {
    // Allow anyone to view balance (remove access control)
    return userToVault[_vaultCreator].balance;
}

    function getTransactions(address _user) external view returns (Transaction[] memory) {
        return userTransactions[_user];
    }

    function checkUsernameAvailability(string calldata _username) external view returns (bool) {
        return usernameToAddress[_username] == address(0);
    }

    function checkPhoneAvailability(string calldata _phoneNumber) external view returns (bool) {
        return phoneToAddress[_phoneNumber] == address(0);
    }
}