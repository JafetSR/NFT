pragma solidity ^0.8.0;

contract WalletMultiSig {
    address[] public owners;        //Cuentas dueñas capaces de aprobar las transacciones
    uint public requiredApprovals;  //Minimo requerido de aprobaciones
    mapping(address => bool) public isOwner;        //Registro de cuentas de dueños

    struct StructTransaction{
        address to;
        uint amount;                //Cantidad en wei (0.00000---01 ether)
        uint approvalCount;         //Cuantas aprovaciones tiene la transaccion
        bool executed;
    }

    StructTransaction[] public transactions;
    mapping(uint => mapping (address=>bool)) public approvals;

    event Deposit(address indexed sender, uint amount);

    constructor(address[] memory _owners, uint _requiredApprovals) {
        require(_owners.length > 0, "Debes tener owners");
        require(_requiredApprovals > 0 && _requiredApprovals <= _owners.length, "Numero Invalido de aprobaciones");
        for(uint i = 0; i < _owners.length; i++){
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        requiredApprovals = _requiredApprovals;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "No es un Owner");
        _;
    }

    function submitTransaction(address _to, uint _amount) public onlyOwner {
        transactions.push(StructTransaction({
            to: _to,
            amount: _amount,
            approvalCount: 0,
            executed: false
        }));
    }

    function approveTransaction(uint _transactionId) public onlyOwner {
        StructTransaction storage transaction = transactions[_transactionId];
        require(!transaction.executed, "Transaccion ya ejecutada");
        require(!approvals[_transactionId][msg.sender], "Ya aprobada");
        approvals[_transactionId][msg.sender] = true;
        transaction.approvalCount += 1;
    }

    function executeTransaction(uint _transactionId) public onlyOwner {
        StructTransaction storage transaction = transactions[_transactionId];
        require(transaction.approvalCount >= requiredApprovals, "No suficientes aprobaciones");
        require(!transaction.executed, "Transaccion ya ejecutada");
        
        transaction.executed = true;
        payable(transaction.to).transfer(transaction.amount);
    }

    function getTransactions() public view returns(StructTransaction[] memory) {
        return transactions;
    }

    function deposit() public payable {
        require(msg.value > 0, "Debes mandar Ether");
        emit Deposit(msg.sender, msg.value);
    }
}