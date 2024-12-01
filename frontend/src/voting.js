import {
    createWalletClient,
    custom,
    getContract,
} from "https://esm.sh/viem";

// Load the navigation content dynamically
fetch('nav.html')
.then(response => response.text())
.then(data => {
    document.getElementById('nav').innerHTML = data;
})
.catch(err => console.error('Error loading nav:', err));


const walletClient = createWalletClient({
    chain: {
        id: 16,  // Chain ID for Coston Testnet
        name: 'Coston Testnet',
        rpcUrls: {
            default: {
                http: ['https://coston-api.flare.network/ext/bc/C/rpc'],
            },
        },
        nativeCurrency: {
            name: 'Coston Flare',
            symbol: 'CFLR',
            decimals: 18,
        },
    },
    transport: custom(window.ethereum),
});

// Connect to Ethereum wallet
const accounts = await walletClient.requestAddresses();
const [address] = accounts;

const votingContractAddress = "0x46e7EE066a90FA0C3730CA1A28D287b6F3306875";
const votingContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_token",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_candidate",
				"type": "string"
			}
		],
		"name": "castVote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_token",
				"type": "string"
			}
		],
		"name": "registerVoter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "_candidates",
				"type": "string[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "candidate",
				"type": "string"
			}
		],
		"name": "VoteCasted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "token",
				"type": "string"
			}
		],
		"name": "VoterRegistered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "candidateExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidates",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCandidates",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRegisteredVoters",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_candidate",
				"type": "string"
			}
		],
		"name": "getVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "registeredVoters",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "hasVoted",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "voteToken",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "votes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const votingContractInstance = getContract({
    address: votingContractAddress,
    abi: votingContractABI,
    client: walletClient,
});

const votesNeeded = 5;
const electionEnded = false;
// Select the container where buttons should go
const buttonContainer = document.querySelector('.buttons');
const electionContainer = document.querySelector('.election');

async function loadCandidates() {
    try {
        // Fetch the candidates array from the contract
        const candidates = await votingContractInstance.read.getCandidates();

        // Populate the dropdown with the candidates
        const selectElement = document.getElementById('candidates');
        candidates.forEach(candidate => {
			if (document.location.pathname.includes("vote.html")) {
				const option = document.createElement('option');
				option.value = candidate;
				option.textContent = candidate;
				selectElement.appendChild(option);
        // Image update as the user selects a candidate
        const candidateImage = document.getElementById('candidateImage');
        
        selectElement.addEventListener('input', (event) => {
            const selectedCandidate = event.target.value;
            if (selectedCandidate) {
                // Show the image when a candidate is selected
                candidateImage.style.display = 'block';
                candidateImage.src = `${selectedCandidate.toLowerCase()}.jpeg`; // Assuming candidate images are named as candidate.jpeg
                candidateImage.alt = `${selectedCandidate} campaign image`;
            } else {
                // Hide the image if no candidate is selected
                candidateImage.style.display = 'none';
            }
        });

			}
			if (document.location.pathname.includes("index.html")) {
				const button = document.createElement('button');
				const image = document.createElement('img');
				button.textContent = candidate;
				button.id = `candidate-${candidate}`;
				button.addEventListener('click', () => {
					console.log(`You voted for ${candidate}`);
					getVotes(candidate);
				});
				image.src = `${candidate.toLowerCase()}.jpeg`; 
				image.alt = `${candidate} campaign image`;
				buttonContainer.appendChild(image);
				buttonContainer.appendChild(button);
			}
        });
    } catch (err) {
        console.error('Error fetching candidates: ', err);
    }
}

async function getVotes(candidate) {
    try {
        // Get the selected candidate from the dropdown
        // const selectElement = document.getElementById('candidates');
        // const selectedCandidate = selectElement.value;

        console.log(`Selected Candidate: ${candidate}`); // Debugging line to check if selectedCandidate is populated

        // Call the smart contract's getVotes function with the selected candidate
        const votes = await votingContractInstance.read.getVotes([candidate]);

        // Display the number of votes for the selected candidate
        document.getElementById('status').textContent = `${candidate} has ${votes} votes.`;
    } catch (err) {
        console.error('Error fetching votes: ', err);
        document.getElementById('status').textContent = 'Error fetching votes.';
    }
}

// Cast vote function
async function castVote() {
    const selectedCandidate = document.getElementById('candidates').value;
    const voterToken = document.getElementById('castVoteToken').value;  // Get the registered token for the voter
    const voterAddress = document.getElementById('castVoteAddress').value;
    try {

		// Call the smart contract's `voters` mapping to check if the voter has voted
        const voterInfo = await votingContractInstance.read.voters([voterAddress]);
		const hasVoted = voterInfo[0]; 

        // Check if the voter has already voted
        if (hasVoted) {
            document.getElementById('status').innerText = 'You have already voted!';
            return;  // Stop execution if the voter has already voted
        }

        // Call the smart contract's registerVoter function
        const accounts = await walletClient.requestAddresses();
        const [accountAddress] = accounts;  // This will be the account making the transaction
        
        const tx = await votingContractInstance.write.castVote([voterAddress, voterToken, selectedCandidate],
             {
                account: accountAddress,  // Use the connected wallet's account
            }
        );
        document.getElementById('status').innerText = 'Vote submitted!';
        // await tx.wait(); // Wait for the transaction to be mined
    } catch (error) {
        console.error("Error submitting vote: ", error);
        document.getElementById('status').innerText = 'Error submitting vote!';
    }
}
// Attach event listener to the vote button
// document.getElementById('voteButton').addEventListener('click', castVote);

async function registerVoter() {
    const voterAddress = document.getElementById('voterAddress').value;
    const voterToken = document.getElementById('voterToken').value;
	const confirmVoterToken = document.getElementById('confirmVoterToken').value;

    if (!voterAddress || !voterToken) {
        document.getElementById('registerStatus').innerText = 'Please provide both voter address and token.';
        return;
    }
	if (voterToken != confirmVoterToken) {
		document.getElementById('registerStatus').innerText = 'Password inputs do not match';
        return;
	}

    try {
        // Check if the voter is already registered
        const registeredVoters = await votingContractInstance.read.getRegisteredVoters();
        if (registeredVoters.includes(voterAddress)) {
            document.getElementById('registerStatus').innerText = 'Voter already registered.';
            return;
        }
        // Call the smart contract's registerVoter function
        const accounts = await walletClient.requestAddresses();
        const [accountAddress] = accounts;  // This will be the account making the transaction
        
        // Call the smart contract's registerVoter function
        const tx = await votingContractInstance.write.registerVoter([voterAddress, voterToken], {
            account: accountAddress,  // Use the connected wallet's account
        });
        
        document.getElementById('registerStatus').innerText = 'Registering voter...';
        // await tx.wait(); // Wait for the transaction to be mined
        
        document.getElementById('registerStatus').innerText = `Voter ${voterAddress} registered successfully!`;
    } catch (error) {
        console.error('Error registering voter: ', error);
        document.getElementById('registerStatus').innerText = 'Error registering voter.';
    }
}

async function getRegisteredVoters() {
    try {
        // Fetch the list of registered voters from the smart contract
        const voters = await votingContractInstance.read.getRegisteredVoters();

        // Get the voter list container
        const voterListContainer = document.getElementById('voterdatabase');
        
        // Clear any existing list items
        voterListContainer.innerHTML = '';

        // Populate the list with each voter as a list item
        voters.forEach(voter => {
            const li = document.createElement('li'); // Create a new list item
            li.textContent = voter;  // Set the text of the list item to the voter's address
            voterListContainer.appendChild(li);  // Append the list item to the list
        });
    } catch (err) {
        console.error('Error fetching registered voters: ', err);
        document.getElementById('voterdatabase').textContent = 'Error fetching registered voters';
    }
}

async function getResults(voteCount) {
    const candidates = await votingContractInstance.read.getCandidates();

    let winners = []; // Track all winners (in case of a tie)

    // Iterate through candidates and determine if they meet the vote threshold
    for (const candidate of candidates) {
        const votes = await votingContractInstance.read.getVotes([candidate]);

        // Check if this candidate has met the vote threshold to win
        if (votes >= voteCount) {
            winners.push(candidate);
        }
    }

    // Only update the UI if there are winners
    if (winners.length > 0) {
        // Hide the default content and show the election results
        document.getElementById('default').style.display = 'none';
        document.getElementById('election').style.display = 'block';
        
        // Display the result based on whether there is a tie or a single winner
        if (winners.length === 1) {
			const image = document.createElement('img');
			image.src = `${winners[0].toLowerCase()}.jpeg`; 
			image.alt = `${winners[0]} campaign image`;
			electionContainer.appendChild(image);
            document.getElementById('election-message').textContent = `${winners[0]} has won the election with ${voteCount} or more votes.`;
        } else {
            document.getElementById('election-message').textContent = `It's a tie! The winners are: ${winners.join(', ')} with ${voteCount} or more votes each.`;


			winners.forEach(winner => {
                const image = document.createElement('img');
                image.src = `${winner.toLowerCase()}.jpeg`;  // Assuming image filenames match candidate names
                image.alt = `${winner} campaign image`;
                electionContainer.appendChild(image);
            });
        }
    }
}



getResults(votesNeeded);
// Determine the page type
if (document.location.pathname.includes("vote.html")) {
    loadCandidates();
    document.getElementById('voteButton').addEventListener('click', castVote);
    // document.getElementById('getVotesButton').addEventListener('click', getVotes);
} else if (document.location.pathname.includes("register.html")) {
    document.getElementById('registerButton').addEventListener('click', registerVoter);
} else if (document.location.pathname.includes('dashboard.html')) {
	getRegisteredVoters();
	// Event listener for password submit
document.getElementById('passwordSubmit').addEventListener('click', function() {
    const enteredPassword = document.getElementById('adminPassword').value;
    const correctPassword = 'password'; // The admin password

    if (enteredPassword === correctPassword) {
        // Hide the password prompt and show the container
        document.getElementById('passwordPrompt').style.display = 'none';
        document.getElementById('container').style.display = 'block';
    } else {
        // Optionally alert the user if the password is incorrect
        alert('Incorrect password. Please try again.');
    }
});
} else {
    loadCandidates();
}

// Function to periodically check the election results
async function checkElectionStatus(voteCount) {
    // Use setInterval to check the results every 5 seconds
    const intervalId = setInterval(async () => {
        const candidates = await votingContractInstance.read.getCandidates();

        let winners = []; // Track all winners (in case of a tie)

        // Iterate through candidates and determine if they meet the vote threshold
        for (const candidate of candidates) {
            const votes = await votingContractInstance.read.getVotes([candidate]);

            // Check if this candidate has met the vote threshold to win
            if (votes >= voteCount) {
                winners.push(candidate);
            }
        }

        // If there are winners, stop the polling and refresh the page or block voting
        if (winners.length > 0 && !electionEnded) {
            clearInterval(intervalId);  // Stop checking the results
            document.getElementById('default').style.display = 'none';
            document.getElementById('election').style.display = 'block';

            // Display the result based on whether there is a tie or a single winner
            if (winners.length === 1) {
                document.getElementById('election-message').textContent = `${winners[0]} has won the election with ${voteCount} or more votes.`;
            } else {
                document.getElementById('election-message').textContent = `It's a tie! The winners are: ${winners.join(', ')} with ${voteCount} or more votes each.`;
            }
			electionEnded = true;
            // Optional: Refresh the page to prevent further voting
            setTimeout(() => {
                location.reload(); // Reload the page after 3 seconds
            }, 3000);
        }
    }, 5000); // Check every 5 seconds
}

// Call this function to start checking the results when the page loads
checkElectionStatus(votesNeeded); // Example: You can pass the required vote count needed to win




// ["Chuck", "John", "Adam"]
// References
// https://learnweb3.io/degrees/ethereum-developer-degree/freshman/build-your-first-d-app-on-ethereum/
// https://dribbble.com/shots/6676961-Cartoon-Avatar-Profile-Picture
// https://www.etsy.com/market/cartoon_profile_pic
// https://www.etsy.com/market/cartoon_profile_pic