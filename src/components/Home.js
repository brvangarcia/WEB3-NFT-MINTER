import WalletBalance from "./WalletBalance";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import LosFeos from "../artifacts/contracts/LosFeos.sol/LosFeos.json";

const contractAddress = "0x5Ca1EBe415A5f9C27BEA8F989Da64d5e14F5C89e";

const provider = new ethers.providers.Web3Provider(window.ethereum);

// get the end user
const signer = provider.getSigner();

// get the smart contract
const contract = new ethers.Contract(contractAddress, LosFeos.abi, signer);

function Home() {
  const [totalMinted, setTotalMinted] = useState(0);
  useEffect(() => {
    getCount();
  }, []);

  const getCount = async () => {
    const count = await contract.count();
    console.log(parseInt(count));
    setTotalMinted(parseInt(count));
  };

  return (
    <div>
      <WalletBalance />
      <section class="text-gray-600 body-font">
        <div class="container px-5 py-24 mx-auto">
          <div class="flex flex-col text-center w-full mb-20">
            <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              Los Feos minter
            </h1>
            <p class="lg:w-2/3 mx-auto leading-relaxed text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            </p>
          </div>
          <div class="flex flex-wrap ">
            {Array(totalMinted + 1)
              .fill(0)
              .map((_, i) => (
                <NFTImage key={i} tokenId={i} getCount={getCount} />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NFTImage({ tokenId, getCount, id }) {
  const contentId = "QmczvYmFEXjHDrrieELZy3GC21ZVD415DaUCqQWydrdfu2";
  const metadataURI = `${contentId}/${tokenId}.json`;
  const imageURI = `https://gateway.pinata.cloud/ipfs/${contentId}/${tokenId}.png`;

  const [isMinted, setIsMinted] = useState(false);
  useEffect(() => {
    getMintedStatus();
  }, [isMinted]);

  const getMintedStatus = async () => {
    const result = await contract.isContentOwned(metadataURI);
    console.log(result);
    setIsMinted(result);
  };

  const mintToken = async () => {
    const connection = contract.connect(signer);
    const addr = connection.address;

    try {
      const result = await contract.payToMint(addr, metadataURI, {
        value: ethers.utils.parseEther("0.05"),
      });
      await result.wait();
      getMintedStatus();
      getCount();
    } catch (error) {
      alert(error.message);
    }
  };

  async function getURI() {
    const uri = await contract.tokenURI(tokenId);
    alert(uri);
  }
  return (
    <div key={id} class="xl:w-1/4 md:w-1/2 p-4">
      <div class="bg-gray-100 p-6 rounded-lg">
        <img
          class=" rounded w-full object-cover object-center mb-6"
          src={
            isMinted
              ? imageURI
              : "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FS_3uaC8X-vo%2Fhqdefault.jpg&f=1&nofb=1"
          }
          alt="content"
        />
        <h5>ID #{tokenId}</h5>
        {!isMinted ? (
          <button
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            onClick={mintToken}
          >
            Mint
          </button>
        ) : (
          <button onClick={getURI}>Taken! Show URI</button>
        )}
      </div>
    </div>
  );
}

export default Home;
