"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function PlayDialog() {
  return (
    <CardContainer className="inter-var">
      <CardBody
        className="bg-gray-50 relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="text-3xl font-bold text-white">
          Celo verse
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-2xl max-w-sm mt-2 dark:text-neutral-300">
          Starting The public Server
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src="/PlayDialog.png"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail" />
        </CardItem>
        <div className="flex justify-center items-start mt-20">
          <Link href={'/Game'}>
          <HoverBorderGradient
        containerClassName="rounded-full"
        as="button" className="text-xl"
      >
        <span>Play</span>
      </HoverBorderGradient>


          </Link>
        </div>
      </CardBody>
    </CardContainer>
  );
}
