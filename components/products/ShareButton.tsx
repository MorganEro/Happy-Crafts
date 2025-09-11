'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Share2, Mail } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa6';

import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

type Props = {
  productName: string;
  productUrl: string;
};

export function ShareButton({ productName, productUrl }: Props) {
  const { user } = useUser();

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out this product: ${productName}`,
          url: productUrl,
        });
      } catch (err) {
        console.error('Share canceled or failed:', err);
      }
    }
  }, [productName, productUrl]);

  const supportsNativeShare =
    typeof navigator !== 'undefined' && !!navigator.share;

  if (!user) {
    return null;
  }

  if (supportsNativeShare) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="p-2 rounded-full bg-white/40 hover:scale-105 transition-transform duration-200 ease-in-out hover:bg-white/40 cursor-pointer dark:hover:bg-white/40"
        onClick={handleNativeShare}>
        <Share2 className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40">
        <DropdownMenuItem asChild>
          <TwitterShareButton
            url={productUrl}
            title={productName}
            className="flex items-center gap-2 w-full">
            <FaXTwitter className="h-4 w-4" /> Twitter
          </TwitterShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <FacebookShareButton
            url={productUrl}
            className="flex items-center gap-2 w-full">
            <FaFacebook className="h-4 w-4" /> Facebook
          </FacebookShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LinkedinShareButton
            url={productUrl}
            title={productName}
            className="flex items-center gap-2 w-full">
            <FaLinkedin className="h-4 w-4" /> LinkedIn
          </LinkedinShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <EmailShareButton
            url={productUrl}
            subject={productName}
            body={`Check out this product: ${productUrl}`}
            className="flex items-center gap-2 w-full">
            <Mail className="h-4 w-4" /> Email
          </EmailShareButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
