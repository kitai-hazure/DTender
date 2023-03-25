// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./lib/GenesisUtils.sol";
import "./interfaces/ICircuitValidator.sol";
import "./verifiers/ZKPVerifier.sol";

contract DTender is ZKPVerifier {
    // @dev TenderCreated event is emitted when a new tender is created
    event TenderCreated(
        uint256 tenderId,
        string name,
        string description,
        uint256 deadline,
        uint256 createdAt,
        string docIpfsHash,
        uint256 minBid,
        uint256 maxBid,
        bool isAccepted,
        address owner
    );
    // @dev BidCreated event is emitted when a new bid is created
    event BidCreated(
        uint256 tenderId,
        uint256 bidId,
        uint256 bidAmount,
        uint256 createdAt,
        address bidOwner
    );
    // @dev BidUpdated event is emitted when a bid is updated
    event BidUpdated(
        uint256 tenderId,
        uint256 bidId,
        uint256 bidAmount,
        uint256 createdAt
    );
    // @dev BidAccepted event is emitted when a bid is accepted
    event BidAccepted(uint256 tenderId, uint256 bidId);

    // @dev Proof Submission event is emitted when a proof is submitted
    event ProofSubmitted(address indexed proofOwner, uint256 indexed proofId);
    // @dev Tender struct
    struct Tender {
        string name;
        string description;
        uint256 deadline;
        uint256 createdAt;
        string docIpfsHash;
        uint256 minBid;
        uint256 maxBid;
        uint256 tenderId;
        bool isAccepted;
        address owner;
    }

    // @dev Bid struct
    struct Bid {
        uint256 bidAmount;
        uint256 bidId;
        uint256 tenderId;
        uint256 createdAt;
        address bidOwner;
    }

    // @dev Modifier to check if the caller is the owner of the tender
    modifier isOwner(uint256 _tenderId) {
        Tender memory _tender = tenders[_tenderId];
        require(
            msg.sender == _tender.owner,
            "Only owner can call this function"
        );
        _;
    }

    // @dev Modifier to check if the caller is the owner of the bid
    modifier isBidOwner(uint256 _bidId) {
        require(
            msg.sender == bids[_bidId].bidOwner,
            "Only bid owner can call this function"
        );
        _;
    }

    // @dev Modifier to check if the tender deadline has passed
    modifier tenderDeadlineNotPassed(uint256 _tenderId) {
        require(
            block.timestamp < tenders[_tenderId].deadline,
            "Tender deadline has passed"
        );
        _;
    }

    modifier isWithinBidRange(uint256 _tenderId, uint256 _bidAmount) {
        require(
            _bidAmount >= tenders[_tenderId].minBid,
            "Bid amount is less than min bid"
        );
        require(
            _bidAmount <= tenders[_tenderId].maxBid,
            "Bid amount is more than max bid"
        );
        _;
    }

    // @dev mapping of tenderId to array of bids
    mapping(uint256 => Bid[]) public tenderBids;
    // @dev mapping of tenderId to tender
    mapping(uint256 => Tender) public tenders;
    // @dev mapping of bidId to bid
    mapping(uint256 => Bid) public bids;
    // @dev array of tenderIds
    uint256[] public tenderIds;

    // @dev createTender function to create a new tender
    function createTender(
        string memory _name,
        string memory _description,
        uint256 _deadline,
        string memory _docIpfsHash,
        uint256 _minBid,
        uint256 _maxBid
    ) public {
        uint256 _createdAt = block.timestamp;
        uint256 _tenderId = uint256(
            keccak256(abi.encodePacked(_name, _createdAt))
        );
        Tender memory _tender = Tender(
            _name,
            _description,
            _deadline,
            _createdAt,
            _docIpfsHash,
            _minBid,
            _maxBid,
            _tenderId,
            false,
            msg.sender
        );
        tenders[_tenderId] = _tender;
        tenderIds.push(_tenderId);
        emit TenderCreated(
            _tenderId,
            _name,
            _description,
            _deadline,
            _createdAt,
            _docIpfsHash,
            _minBid,
            _maxBid,
            false,
            msg.sender
        );
    }

    // @dev updateTender function to update an existing tender
    function createBid(
        uint256 _tenderId,
        uint256 _bidAmount
    )
        public
        tenderDeadlineNotPassed(_tenderId)
        isWithinBidRange(_tenderId, _bidAmount)
    {
        uint256 _createdAt = block.timestamp;
        uint256 _bidId = uint256(
            keccak256(abi.encodePacked(_tenderId, _createdAt))
        );
        Bid memory _bid = Bid(
            _bidAmount,
            _bidId,
            _tenderId,
            _createdAt,
            msg.sender
        );
        tenderBids[_tenderId].push(_bid);
        bids[_bidId] = _bid;
        emit BidCreated(_tenderId, _bidId, _bidAmount, _createdAt, msg.sender);
    }

    // @dev updateTender function to update an existing tender
    function updateBid(
        uint256 _bidId,
        uint256 _bidAmount
    )
        public
        isBidOwner(_bidId)
        tenderDeadlineNotPassed(bids[_bidId].tenderId)
        isWithinBidRange(bids[_bidId].tenderId, _bidAmount)
    {
        Bid memory _bid = bids[_bidId];
        _bid.bidAmount = _bidAmount;
        bids[_bidId] = _bid;
        emit BidUpdated(_bid.tenderId, _bidId, _bidAmount, _bid.createdAt);
    }

    // @dev getTenderBids function to get all bids for a tender
    function getTenderBids(
        uint256 _tenderId
    ) public view returns (Bid[] memory) {
        return tenderBids[_tenderId];
    }

    // @dev getTender function to get a tender
    function getTender(uint256 _tenderId) public view returns (Tender memory) {
        return tenders[_tenderId];
    }

    // @dev getBid function to get a bid
    function getBid(uint256 _bidId) public view returns (Bid memory) {
        return bids[_bidId];
    }

    // @dev acceptBid function to accept a bid
    function acceptBid(
        uint256 _tenderId,
        uint256 _bidId
    ) public payable isOwner(_tenderId) {
        require(
            msg.value == bids[_bidId].bidAmount,
            "Amount sent is not equal to bid amount"
        );
        require(
            !tenders[_tenderId].isAccepted,
            "Tender has already been accepted"
        );
        Bid memory _bid = bids[_bidId];
        payable(_bid.bidOwner).transfer(_bid.bidAmount);
        tenders[_tenderId].isAccepted = true;
        emit BidAccepted(_tenderId, _bidId);
    }

    // @dev getTenders function to get all tenders
    function getTenders() public view returns (Tender[] memory) {
        Tender[] memory _tenders = new Tender[](tenderIds.length);
        for (uint256 i = 0; i < tenderIds.length; i++) {
            _tenders[i] = tenders[tenderIds[i]];
        }
        return _tenders;
    }

    // POLYGON ID STUFF
    uint64 public constant TRANSFER_REQUEST_ID = 1;

    mapping(uint256 => address) public idToAddress;
    mapping(address => uint256) public addressToId;

    function _beforeProofSubmit(
        uint64 /* requestId */,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal view override {
        // check that  challenge input is address of sender
        address addr = GenesisUtils.int256ToAddress(
            inputs[validator.getChallengeInputIndex()]
        );
        // this is linking between msg.sender and
        require(
            _msgSender() == addr,
            "address in proof is not a sender address"
        );
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        require(
            requestId == TRANSFER_REQUEST_ID && addressToId[_msgSender()] == 0,
            "proof can not be submitted more than once"
        );

        uint256 id = inputs[validator.getChallengeInputIndex()];

        // below condition satisfies that the same identity can not be used twice
        if (idToAddress[id] == address(0)) {
            addressToId[_msgSender()] = id;
            idToAddress[id] = _msgSender();
        }
        emit ProofSubmitted(_msgSender(), id);
    }

    modifier _onlyTrustedAddress(address addr) {
        require(
            proofs[addr][TRANSFER_REQUEST_ID] == true,
            "only identities who provided proof are allowed to continue"
        );
        _;
    }
}
