import { Contract } from "ethers";
import { MEDBLOC_CONTRACT } from "../contracts/medbloc";
import { getSigner } from "./web3";

export async function getMedblocContract() {
  const signer = await getSigner();
  return new Contract(MEDBLOC_CONTRACT.address, MEDBLOC_CONTRACT.abi, signer);
}
