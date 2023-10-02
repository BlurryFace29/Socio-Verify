import { connectToDB } from '@/utils/database';
import Post from '@/models/post'
import User from '@/models/user';
import { ethers } from 'ethers';

const contractABI = [
  'function getVerificationStatus(bytes20 _verificationId) public view returns (bool)'
];

const provider = new ethers.JsonRpcProvider(process.env.TRON_RPC_URL);
const contract = new ethers.Contract(
  process.env.ContentAuthenticator_ADDRESS,
  contractABI,
  provider
);

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const isVerified = await contract.getVerificationStatus(`0x${params.id}`);

    if (!isVerified) return new Response(JSON.stringify({ success: false }), { status: 200 });

    const post = await Post.findOne({ verificationId: params.id }).populate('creator');
    if(!post) return new Response('Verification was successful but MongoDB gave some error', { status: 500 });

    const response = await fetch(`${process.env.PINATA_GATEWAY}/${post.cid}`);
    if (!response.ok) {
      return new Response('Failed to fetch content from Pinata', { status: 500 });
    }
    const content = await response.json();

    return new Response(JSON.stringify({ success: true, post, content }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(`Failed to fetch post: ${error}`, { status: 500 });
  }
}
