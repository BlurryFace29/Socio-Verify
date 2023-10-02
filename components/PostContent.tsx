'use client';

import { useEffect, useState } from 'react';

import HyperText from "@/components/HyperText";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MSG_TRUNCATE_LENGTH = 500;
const MSG_TRUNCATE_LINES = 8;

type File = {
  cid: string;
  fileType: string;
};

const isTooLong = (content: string) => {
  return (
    content?.length > MSG_TRUNCATE_LENGTH ||
    content.split('\n').length > MSG_TRUNCATE_LINES
  );
};

const PostContent = ({ content, files, post_cid, standalone }: { content: string, files: File[], post_cid: string, standalone: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(standalone);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 350 });

  const tooLong = !standalone && isTooLong(content);
  const displayedContent = isExpanded || !tooLong ? content : content.slice(0, MSG_TRUNCATE_LENGTH) + '...';

  const router = useRouter();

  useEffect(() => {
    files.forEach((file) => {
      if (file.fileType === "image") {
        const img = new window.Image();
        img.src = `https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const newWidth = 350 * aspectRatio;
          setImageDimensions({ width: newWidth, height: 350 });
        };
      }
    });
  }, [files]);

  return (
    <div className="mt-3 mb-3 mr-6">
      {files?.map((file, index) => {
        if (file.fileType === "image") {
          return (
            <div
              key={file.cid + index}
              style={{ width: imageDimensions.width, height: imageDimensions.height }}
              className="relative mb-3 mt-3 flex rounded-md overflow-hidden"
            >
              <Image
                src={`https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`}
                alt="Embedded content"
                width={imageDimensions.width}
                height={imageDimensions.height}
              />
            </div>
          );
        } else if (file.fileType === "video") {
          return (
            <div key={file.cid + index} className="mb-3 mt-3">
              <video controls width="100%">
                <source src={`https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return null;
      })}

      <div className={`whitespace-pre-wrap ${standalone ? 'text-lg' : 'text-md'}`}>
        <HyperText>
          {displayedContent}
        </HyperText>
      </div>

      {tooLong && (
        <button
          className="text-iris-blue hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default PostContent;
