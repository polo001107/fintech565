// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    
    // Struct to store proposal details
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        uint startTime;
        uint endTime;
        bool active;
    }

    // Owner of the contract (admin)
    address public owner;

    // Mapping of proposal ID to Proposal object
    mapping(uint => Proposal) public proposals;
    
    // Mapping to check if an address has voted on a specific proposal
    mapping(address => mapping(uint => bool)) public hasVoted;

    // Mapping to track registered voters
    mapping(address => bool) public isRegistered;

    // Proposal counter for unique proposal IDs
    uint public proposalCounter = 0;

    // Events
    event ProposalCreated(uint proposalId, string description, uint startTime, uint endTime);
    event Voted(address voter, uint proposalId);
    event VotingEnded(uint proposalId, uint voteCount);
    event UserRegistered(address user);

    // Constructor: Set the contract owner to the deployer
    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict functions to only the owner/admin
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    // Modifier to check if the proposal is active
    modifier onlyActiveProposal(uint _proposalId) {
        require(proposals[_proposalId].active, "Proposal is not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting period has ended");
        _;
    }

    // Modifier to check if the user is registered
    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "You must be registered to perform this action");
        _;
    }

    // Register a user to allow them to vote
    function registerUser() public {
        require(!isRegistered[msg.sender], "You are already registered");
        
        // Register the user
        isRegistered[msg.sender] = true;

        emit UserRegistered(msg.sender);
    }

    // Create a new proposal (onlyOwner can create proposals)
    function createProposal(string memory _description, uint _durationInMinutes) public onlyOwner {
        require(bytes(_description).length > 0, "Proposal description cannot be empty");
        proposalCounter++;
        
        // Define the voting period (current time + duration)
        uint startTime = block.timestamp;
        uint endTime = startTime + (_durationInMinutes * 1 minutes);

        // Create a new proposal
        proposals[proposalCounter] = Proposal(proposalCounter, _description, 0, startTime, endTime, true);
        
        emit ProposalCreated(proposalCounter, _description, startTime, endTime);
    }

    // Vote on a proposal (only registered users can vote)
    function vote(uint _proposalId) public onlyRegistered onlyActiveProposal(_proposalId) {
        require(!hasVoted[msg.sender][_proposalId], "You have already voted on this proposal");

        // Increase the vote count for the proposal
        proposals[_proposalId].voteCount++;

        // Mark that the user has voted
        hasVoted[msg.sender][_proposalId] = true;

        emit Voted(msg.sender, _proposalId);
    }

    // End voting for a proposal (onlyOwner can end voting)
    function endVoting(uint _proposalId) public onlyOwner {
        require(proposals[_proposalId].active, "Proposal is already ended or does not exist");
        
        // Set the proposal as inactive
        proposals[_proposalId].active = false;

        emit VotingEnded(_proposalId, proposals[_proposalId].voteCount);
    }

    // Get proposal details
    function getProposal(uint _proposalId) public view returns (string memory, uint, uint, uint, bool) {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.description,
            proposal.voteCount,
            proposal.startTime,
            proposal.endTime,
            proposal.active
        );
    }
}