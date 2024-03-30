import { InterfaceAbi } from 'ethers';

export interface GetContractAbiResponse {
  abi: InterfaceAbi;
  name: string;
  error?: string;
  code?: number;
}

const getContractAbi = (chainId: number, address: string) => {
  return fetch(`https://anyabi.xyz/api/get-abi/${chainId}/${address}`).then(
    (res) => res.json(),
  ) as Promise<GetContractAbiResponse>;
};

export const client = { getContractAbi };
