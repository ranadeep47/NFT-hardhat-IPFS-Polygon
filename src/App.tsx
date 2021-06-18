import './App.css';
import Token from './artifacts/contracts/NFT.sol/MyNFT.json';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { Spinner } from "baseui/spinner";
import {styled, useStyletron} from 'baseui';
import Web3Modal from "web3modal";

const Label = styled('label', {
  width: "200px"
})

const Container = styled('div', {
  background: "rgb(255 218 163)",
  padding: "2rem",
})

const Image = styled('img', {
  width: "320px",
  height: "280px",
  objectFit: "cover"
})

const CollectbleContainer = styled('div', {
  "margin": "2rem 0",
  marginLeft: "0",
  display: "flex",
  flexDirection: "row"
})

async function fetchMetadata(cid) {
  const url = `https://ipfs.io/ipfs/${cid}`
  const response = await axios.get(url);
  return response.data;
}

function ConnectHeader({onConnected}) {
  const [css, theme] = useStyletron();

  const providerOptions = {
    /* See Provider Options Section */
  };
  
  const web3Modal = new Web3Modal({
    providerOptions // required
  });

  useEffect(async () => {
    
  })  

  async function onConnect() {
    const provider = await web3Modal.connect();
    onConnected(provider);
  }

  return (
    <div className={css({padding: "0rem 4rem", display: "flex", justifyContent: "flex-end"})}>
      <Button onClick={onConnect} className={css({borderRadius: '4px'})}>Connect</Button>
    </div>
  )
}

function Collectible({item, onTransfer}) {
  const [metadata, setMetadata] = useState(null);
  const [css, theme] = useStyletron();
  const [transerAddress, setTranserAddress] = useState('')
  

  useEffect(async () => {
    let metadata = await fetchMetadata(item.tokenURI);   
    metadata.imageURL = `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`
    setMetadata(metadata);
  }, [item])

  const onSubmit = () => {
    onTransfer(transerAddress, item.tokenId);
  }

  return (
    <div>
      { 
      metadata ? 
      <CollectbleContainer>
        <Image src={metadata.imageURL} />
        <div className={css({marginLeft: '1rem'})}>
          <h1 className={css({margin: '0'})}>{metadata.name}</h1>
          <h4>Description: {metadata.description}</h4>
          <div className={css({})}>
              <Label>📨 Transfer to:</Label>
              <div className={css({display: "flex", flexDirection: 'row'})}>
                <Input
                    value={transerAddress}
                    onChange={ e => setTranserAddress(e.currentTarget.value)}
                    placeholder="0x.."
                    overrides={{
                    Root: {
                        style: {

                        },
                    },
                    }}
                />
                <Button onClick={onSubmit}>Transfer</Button>
              </div>
            </div> 
        </div>
      </CollectbleContainer>
      : <Spinner /> 
      }
    </div>
  )
}

function Collectibles({data, onTransfer}) {
  const [css, theme] = useStyletron();

  return (
    <div className={css({display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between"})}>
      { data.map((item, i) => <Collectible key={i} item={item} onTransfer={onTransfer}/>) }
    </div>

  )
}

const contractAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508"

function App(props) {
  const [css, theme] = useStyletron();
  const [showLoader, setShowLoader] = useState(true);
  const [contract, setContract] = useState(null);
  const [collectibles, setCollectibles] = useState([]);
  const [account, setAccount] = useState(null);

  async function onConnect(web3Provider) {
    // const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setShowLoader(true);
    const provider = new ethers.providers.Web3Provider(web3Provider);

    web3Provider.on("accountsChanged", async (accounts: string[]) => {
      console.log('Accounts Changed',accounts);
      await initialise(provider);
    });
    // Subscribe to provider connection
    web3Provider.on("connect", (info: { chainId: number }) => {
      console.log('on connected' ,info);
    });

    // Subscribe to provider disconnection
    web3Provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log(error);
    });

    await initialise(provider);
  }

  async function initialise(provider) {
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    setAccount(account);
    const contract = new ethers.Contract(contractAddress, Token.abi, provider);
    const contractWithSigner = contract.connect(signer);
    setContract(contractWithSigner);
    const balance = await contract.balanceOf(account);
    setShowLoader(false);

    const data = [];
    for(var i=0; i<balance.toNumber(); ++i) {
      let tokenId = await contract.tokenOfOwnerByIndex(account, i);
      let tokenURI = await contract.tokenURI(tokenId);    
      data.push({tokenId, tokenURI});
    }
    setCollectibles(data);
  }

  useEffect(async () => {

  }, [])

  async function onTransfer(transferTo,tokenId) {
    console.log('Transferring to :', transferTo, tokenId.toNumber());
    contract.transferFrom(account, transferTo, tokenId);
  }

  return (
    <div className="App">
      <Container>    
        <ConnectHeader onConnected={onConnect}/>            
        {showLoader ? <Spinner /> : 
        <>
          <h1>My Collectibles</h1>
          <Collectibles data={collectibles} onTransfer={onTransfer}/>
        </>
        }
      </Container>
    </div>
  );
}

export default App;
