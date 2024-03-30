import { InterfaceAbi } from 'ethers';

export interface ContractData {
  abi: InterfaceAbi;
  name: string;
}

const getContractAbi = (chainId: number, address: string) => {
  return fetch(`https://anyabi.xyz/api/get-abi/${chainId}/${address}`).then(
    (res) => res.json(),
  ) as Promise<ContractData>;
};

export const client = { getContractAbi };
