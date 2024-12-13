import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import VotingABI from "./VotingABI.json"; // The ABI of the smart contract

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xYourContractAddressHere";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  // State variables
  const [isRegistered, setIsRegistered] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState("");
  const [voteProposalId, setVoteProposalId] = useState("");

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setProvider(provider);
      setSigner(signer);
      setAccount(address);

      // Connect to the smart contract
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        VotingABI,
        signer
      );
      setContract(votingContract);

      // Check if the user is registered
      const isUserRegistered = await votingContract.isRegistered(address);
      setIsRegistered(isUserRegistered);

      // Fetch proposals
      await fetchProposals(votingContract);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Register user
  const registerUser = async () => {
    try {
      const tx = await contract.registerUser();
      await tx.wait();
      alert("Registration successful!");
      setIsRegistered(true);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  // Create a new proposal
  const createProposal = async () => {
    try {
      const duration = 10; // Duration in minutes
      const tx = await contract.createProposal(newProposal, duration);
      await tx.wait();
      alert("Proposal created successfully!");
      setNewProposal("");
      await fetchProposals(contract);
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  // Vote on a proposal
  const voteOnProposal = async () => {
    try {
      const tx = await contract.vote(voteProposalId);
      await tx.wait();
      alert("Vote submitted successfully!");
      setVoteProposalId("");
      await fetchProposals(contract);
    } catch (error) {
      console.error("Error voting on proposal:", error);
    }
  };

  // Fetch all proposals
  const fetchProposals = async (votingContract) => {
    try {
      const proposalsList = [];
      for (let i = 1; i <= 10; i++) {
        try {
          const proposal = await votingContract.getProposal(i);
          proposalsList.push({
            id: i,
            description: proposal[0],
            voteCount: parseInt(proposal[1]),
            startTime: new Date(proposal[2] * 1000).toLocaleString(),
            endTime: new Date(proposal[3] * 1000).toLocaleString(),
            active: proposal[4],
          });
        } catch {
          break;
        }
      }
      setProposals(proposalsList);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Decentralized Voting DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      <hr />

      {!isRegistered && account ? (
        <div>
          <h2>Register</h2>
          <button onClick={registerUser}>Register as Voter</button>
        </div>
      ) : (
        <p>You are registered!</p>
      )}

      <hr />

      <div>
        <h2>Create Proposal</h2>
        <input
          type="text"
          placeholder="Enter proposal description"
          value={newProposal}
          onChange={(e) => setNewProposal(e.target.value)}
        />
        <button onClick={createProposal}>Submit Proposal</button>
      </div>

      <hr />

      <div>
        <h2>Vote on Proposal</h2>
        <input
          type="number"
          placeholder="Enter Proposal ID"
          value={voteProposalId}
          onChange={(e) => setVoteProposalId(e.target.value)}
        />
        <button onClick={voteOnProposal}>Vote</button>
      </div>

      <hr />

      <div>
        <h2>Proposals</h2>
        {proposals.length === 0 ? (
          <p>No proposals available</p>
        ) : (
          <ul>
            {proposals.map((proposal) => (
              <li key={proposal.id}>
                <strong>ID:</strong> {proposal.id} <br />
                <strong>Description:</strong> {proposal.description} <br />
                <strong>Votes:</strong> {proposal.voteCount} <br />
                <strong>Start Time:</strong> {proposal.startTime} <br />
                <strong>End Time:</strong> {proposal.endTime} <br />
                <strong>Active:</strong> {proposal.active ? "Yes" : "No"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;