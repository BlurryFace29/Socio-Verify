'use client'

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import {
  LinkIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import PostContent from '@/components/PostContent';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link'

type ReplyingToDB = {
  address: string;
  cid: string;
};

type Post = {
  _id: string;
  creator: {
    _id: string;
    address: string;
    username: string;
    timestamp: Date;
    bio?: string;
    email?: string;
    name?: string;
    profilePicture?: string;
    website?: string;
  };
  signature: string;
  verificationId: string;
  cid: string;
  timestamp: Date;
  replyingTo?: ReplyingToDB[];
};

type File = {
  cid: string;
  fileType: string;
};

type ReplyingTo = {
  address: string;
  username: string;
  cid: string;
};

type Content = {
  content: string;
  files: File[];
  replyingTo?: ReplyingTo[];
};

type AllPostData = {
  post: Post;
  content: Content;
};

export default function VerificationPage({ params }: { params: { id: string } }) {
  const [postData, setPostData] = useState<AllPostData | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  function removeHttp(url: string) {
    return url.replace(/(^\w+:|^)\/\//, '');
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();

    const data = {
      cid: postData?.post.cid,
      address: postData?.post.creator.address,
      signature: postData?.post.signature,
      verificationId: postData?.post.verificationId,
    };

    navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/post/${params.id}`);
        console.log(response.data);

        const { success, ...dataWithoutSuccess } = response.data;
        setIsVerified(success);
        setPostData(dataWithoutSuccess);

      } catch (error) {
        console.error('Error fetching post data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  return (
    <div className="flex justify-center items-center min-h-full overflow-auto">
      {isLoading ? (
        <div className="flex flex-col items-center w-full mt-20">
          <Skeleton className="h-[300px] w-[300px] rounded-full mb-8" />
          <div className="flex flex-col items-start space-y-4 mb-8">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-[300px] w-[500px] mt-8" />
        </div>
      ) : isVerified ? (
        <div className="flex flex-col items-center w-full">
          <div className="flex space-x-6 mt-20" style={{ marginLeft: '-160px' }}>
            <div className="flex flex-col items-start max-w-[250px]">
              {postData?.post.creator?.name ? (
                <>
                  <h2 className="text-3xl font-bold mt-24">{postData.post.creator.name}</h2>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Link
                        href={`https://blockto.in/${postData.post.creator.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-zinc-500"
                      >
                        <h3 className="text-2xl font-semibold text-zinc-500 mr-8">@{postData.post.creator.username}</h3>
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-black w-52">
                      Checkout his profile on Blockto
                    </HoverCardContent>
                  </HoverCard>
                </>
              ) : (
                <HoverCard>
                  <HoverCardTrigger>
                    <Link
                      href={`https://blockto.in/${postData?.post.creator.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      <h2 className="text-3xl font-bold mt-24">{postData?.post.creator.username}</h2>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-black w-52">
                    Checkout his profile on Blockto
                  </HoverCardContent>
                </HoverCard>
              )}
              <p className="text-md mt-4">{postData?.post.creator?.bio}</p>
              {postData?.post.creator?.website && (
                <div className="flex items-center space-x-1 mt-4">
                  <LinkIcon className="h-4 w-4 text-violet-500" />
                  <Link
                    href={postData.post.creator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-500 hover:underline"
                  >
                    {removeHttp(postData.post.creator.website)}
                  </Link>
                </div>
              )}
            </div>
            <Avatar className="w-[300px] h-[300px]">
              <AvatarImage src={postData?.post.creator?.profilePicture || '/default.png'} />
              <AvatarFallback>{postData?.post.creator.username}</AvatarFallback>
            </Avatar>
          </div>

          {postData && (
            <HoverCard>
              <HoverCardTrigger>
                <Card
                  className="mt-8 max-w-[730px] min-w-[350px] min-h-[100px] hover:border-zinc-500 transition-all"
                  onClick={() => window.open(`https://blockto.in/post${postData?.post.cid}`, '_blank')}
                >
                  <CardContent className="flex relative">
                    <PostContent
                      content={postData.content.content}
                      files={postData.content.files}
                      post_cid={postData.post.cid}
                      standalone={true}
                    />
                    <img
                      src="/verified.png"
                      alt="Verified"
                      className="absolute top-5 right-2 h-7 w-7"
                    />
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="absolute top-14 right-3">
                          <button
                            onClick={(e) => handleCopy(e)}
                            className='focus:outline-none'
                          >
                            {copied ? (
                              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-500" />
                            )}
                          </button>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="bg-black w-52">
                        Copy Verification Data
                      </HoverCardContent>
                    </HoverCard>
                  </CardContent> 
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="bg-black w-52">
                Checkout this post on Blockto
              </HoverCardContent>
            </HoverCard>
          )}
        </div>

      ) : isVerified === false ? (
        <Card className="bg-black text-white w-[425px] mt-80">
          <CardHeader className='text-center text-bold text-lg'>
            <CardTitle>VERIFICATION FAILED</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Verification failed for the Verification ID: {params.id}.</p>
            <p>Please check the ID and try again.</p>
          </CardContent>
        </Card>

      ) : hasError && (
        <Card className="bg-red-500 text-white w-[460px]">
          <CardHeader className='text-center text-bold text-xl'>
            <CardTitle>ERROR</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We were unable to retrieve the data for Verification ID: {params.id}.</p>
            <p>Please try again later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
