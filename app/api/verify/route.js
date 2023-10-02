import { ethers } from 'ethers';

const contractABI = [
  'function verifyContent(string memory _cid, bytes memory _signature, address _userAddress) public view returns (bytes20)'
];

const provider = new ethers.JsonRpcProvider(process.env.TRON_RPC_URL);
const contract = new ethers.Contract(
  process.env.ContentAuthenticator_ADDRESS,
  contractABI,
  provider
);

export const POST = async (req) => {
  const { cid, address, signature } = await req.json();

  if (!cid || !signature || !address) {
    return new Response(JSON.stringify({ error: 'cid, signature and address are required' }), {
      status: 400
    });
  }

  try {
    const bytesSignature = ethers.getBytes(signature);
    const verificationIdBytes = await contract.verifyContent(cid, bytesSignature, address);
    const verificationId = ethers.hexlify(verificationIdBytes).substring(2);

    if (verificationId) {
      console.log('Verification id:', verificationId);
      return new Response(JSON.stringify({ success: true, verificationId }), {
        status: 200
      });
    } else {
      console.log('Verification failed');
      return new Response(JSON.stringify({ success: false }), {
        status: 200
      });
    }
  } catch (error) {
    console.error('Error verifying content:', error);
    return new Response(JSON.stringify({ error: 'Error verifying content' }), {
      status: 500
    });
  }
}
