import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace: "DTender",
});

const Schema = await db.applySchema(`
@public
collection DynamicNFTMetadata {
  id: string;
  // Use the NFT format
  name: string;
  // Image could link to the location of the file on IPFS, Arweave, etc.
  image: string;
  
  // Any additional properties you want
  level: number;

  constructor (id: string, name: string, image: string) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.level = 0;
  }

  // You can add your own functions to determine rules
  // on who can update the data
  function setlevel (level: number) {
    this.level = level;
  }
  function getlevel () {
    return level;
  }
}
    
`);
