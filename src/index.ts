import dotenv from "dotenv";
dotenv.config();

import process from "process";
import { ethers } from "ethers";
import OptimisticTimelock from "../contracts/dao/OptimisticTimelock.sol/OptimisticTimelock.json";

// - What are we looking at?

const contractAddress = "0xbc9c084a12678ef5b516561df902fdc426d95483";
const contractAbi = OptimisticTimelock.abi;

const rolesToInspect = [
  "CONTRACT_ADMIN_ROLE",
  "DEFAULT_ADMIN_ROLE",
  "EXECUTOR_ROLE",
  "PROPOSER_ROLE",
  "TIMELOCK_ADMIN_ROLE",
];

// - Setup

const config = () => {
  const vars = ["ALCHEMY_URL"];

  vars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env var ${key}`);
    }
  });

  return vars.reduce(
    (acc, key) => ({ ...acc, [key]: process.env[key] }),
    {} as Record<string, string>
  );
};

const env = config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(env.ALCHEMY_URL);
  // const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, contractAbi, provider);

  const roleHashes = await Promise.all(
    rolesToInspect.map(async (role) => await contract[role]())
  );

  const rolesToRoleHashes = rolesToInspect.reduce(
    (acc, role, i) => ({ ...acc, [role]: roleHashes[i] }),
    {} as Record<string, string>
  );

  Object.keys(rolesToRoleHashes).forEach(async (role) => {
    const roleGrantedEvent = contract.filters.RoleGranted(
      rolesToRoleHashes[role]
    );
    const roleRevokedEvent = contract.filters.RoleRevoked(
      rolesToRoleHashes[role]
    );

    const rolesGranted = await contract.queryFilter(roleGrantedEvent);
    const rolesRevoked = await contract.queryFilter(roleRevokedEvent);
    const roleAccounts = new Set<string>();

    rolesGranted.forEach((event) => {
      roleAccounts.add(event.args.account);
    });

    rolesRevoked.forEach((event) => {
      roleAccounts.delete(event.args.account);
    });

    console.log(`${role} accounts:`);
    roleAccounts.forEach((account) => {
      console.log(`https://etherscan.io/address/${account}`);
    });
    console.log("\n");
  });
};

main();
