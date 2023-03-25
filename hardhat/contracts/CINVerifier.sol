// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./lib/GenesisUtils.sol";
import "./interfaces/ICircuitValidator.sol";
import "./verifiers/ZKPVerifier.sol";

contract CINVerifier is ZKPVerifier {
    uint64 public constant TRANSFER_REQUEST_ID = 1;

    mapping(uint256 => address) public idToAddress;
    mapping(address => uint256) public addressToId;

    constructor() {}

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
    }

    modifier _onlyTrustedAddress(address addr) {
        require(
            proofs[addr][TRANSFER_REQUEST_ID] == true,
            "only identities who provided proof are allowed to continue"
        );
        _;
    }
}
