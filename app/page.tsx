'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator"

const DetailSchema = z.object({
  cid: z.string().regex(/^Qm[a-zA-Z0-9]{44}$/, "Invalid CID"),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Address"),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, "Invalid Signature")
});
type DetailFormValues = z.infer<typeof DetailSchema>;

const IdSchema = z.object({
  verificationId: z.string().regex(/^[a-fA-F0-9]{40}$/, "Invalid Verification ID"),
});
type IdFormValues = z.infer<typeof IdSchema>;

export default function Home() {
  const router = useRouter()

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleDetailSubmit = async (data: DetailFormValues) => {
    setIsLoadingDetail(true);
    
    try {
      const response = await axios.post('/api/verify', {
        cid: data.cid,
        address: data.address,
        signature: data.signature
      });
  
      if(response.data.success) {
        console.log(response.data);
        router.push(`/${response.data.verificationId}`);
      } else {
        alert("Verification failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while verifying content.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleIdSubmit = async (data: IdFormValues) => {
    router.push(`/${data.verificationId}`);
  }

  const DetailForm = useForm<DetailFormValues>({
    resolver: zodResolver(DetailSchema)
  });

  const IdForm = useForm<IdFormValues>({
    resolver: zodResolver(IdSchema)
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 w-full">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-10 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[250px] z-[-1]">
        <h1 className='relative dark:drop-shadow-[0_0_0.1rem_#ffffff70] mb-20 text-5xl font-bold'>Socio Content Verification</h1>
      </div>

      <div className="rounded border shadow">
        <div className="p-12">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }} >
            <div>
              <h1 className="text-xl font-semibold pb-1 mr-12">Using CID, Address and Signature</h1>
              <p className="text-sm text-muted-foreground mr-12">
                Manually verify a content by providing its CID, creator's address and signature.
              </p>
              <Separator orientation="horizontal" className="my-6" />
              <Form {...DetailForm}>
                <form onSubmit={DetailForm.handleSubmit(handleDetailSubmit)} className="space-y-6 mr-12">
                  <FormField
                    control={DetailForm.control}
                    name="cid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CID</FormLabel>
                        <FormControl>
                          <Input placeholder="QmdSRKWwspnMPnshmLHYfteKtC8hmL68wSiuwuEWEkFkur" {...field} autoComplete="off" />
                        </FormControl>
                        <FormDescription>
                          The IPFS Content Identifier of the content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={DetailForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0xAcC24C0231E34756D02634E0E83326922f1b424b" {...field} autoComplete="off" />
                        </FormControl>
                        <FormDescription>
                          The wallet address of the content creator.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={DetailForm.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature</FormLabel>
                        <FormControl>
                          <Input placeholder="0x2a8a8f9cae7df36b390b87e8533ba32e011a62be33f8287fd5773d7111b18b687ebbf7f999729e1b6ff51bd70aa54bc7f0a253577e2c2c6400ba2dfdd04162d41b" {...field} autoComplete="off" />
                        </FormControl>
                        <FormDescription>
                          The cryptographic signature of the content's CID.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoadingDetail}>
                    {isLoadingDetail ? 'Verifying...' : 'Verify'}
                  </Button>
                </form>
              </Form>
            </div>

            <Separator orientation="vertical" />
            <div>
              <h1 className="text-xl font-semibold pb-1 ml-12">Using Verification ID</h1>
              <p className="text-sm text-muted-foreground ml-12">
                Verify a content directly using it's verificarion ID provided by Blockto.
              </p>
              <Separator orientation="horizontal" className="my-6" />
              <Form {...IdForm}>
                <form onSubmit={IdForm.handleSubmit(handleIdSubmit)} className="space-y-6 ml-12">
                  <FormField
                    control={IdForm.control}
                    name="verificationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification ID</FormLabel>
                        <FormControl>
                          <Input placeholder="4a5aa878184cfc30f3c38435b9c2601783fac907" {...field} autoComplete="off" />
                        </FormControl>
                        <FormDescription>
                          The Verification ID provided by Blockto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Verify</Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
