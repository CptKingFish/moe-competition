"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RouterOutputs } from "@/trpc/react";

interface Winner {
  name: string;
  position: number;
  authorAvatar: string;
  project: string;
  projectImage: string;
  votes: number;
}

interface PodiumProps {
    projects: RouterOutputs["projects"]["getTop10Projects"];
}

const podiumVariants = {
  initial: { y: 50, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 1.2,
      ease: "easeOut",
    },
  },
};

const avatarVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      duration: 0.9,
      delay: 0.2,
      ease: "easeOut",
    },
  },
};

const projectImageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Podium() {
  const winners: Winner[] = [
    {
      name: "Wade",
      position: 1,
      authorAvatar: "/placeholder.svg?height=60&width=60",
      project: "AI Assistant",
      projectImage:
        "https://cdn2.scratch.mit.edu/get_image/project/712358577_480x360.png",
      votes: 1024,
    },
    {
      name: "Dianne",
      position: 3,

      authorAvatar: "/placeholder.svg?height=60&width=60",
      project: "Smart Home",
      projectImage: "/placeholder.svg?height=80&width=80",
      votes: 986,
    },
    {
      name: "Esther",
      position: 2,
      authorAvatar: "/placeholder.svg?height=60&width=60",
      project: "EcoTracker",
      projectImage: "/placeholder.svg?height=80&width=80",
      votes: 1002,
    },
  ];

  const podiumOrder = [1, 0, 2];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex items-end justify-center gap-2 sm:gap-4">
          {podiumOrder.map((index) => {
            const winner = winners[index];
            const isFirst = winner?.position === 0;
            const heights = {
              1: "h-64 sm:h-[18rem]",
              2: "h-56 sm:h-[16rem]",
              3: "h-48 sm:h-[14rem]",
            };
            const positions = {
              1: "bg-[#FFF4D8]",
              2: "bg-[#F5F5F5]",
              3: "bg-[#F8F3F3]",
            };

            return (
              <motion.div
                key={winner?.position}
                className={`flex flex-col items-center gap-2 ${isFirst ? "order-2" : ""}`}
                variants={podiumVariants}
                initial="initial"
                animate="animate"
                transition={{
                  delay: index * 0.2,
                  duration: 0.5,
                }}
              >
                <motion.div
                  className="relative"
                  variants={avatarVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Avatar className="h-10 w-10 border-2 border-white shadow-lg sm:h-12 sm:w-12">
                    <AvatarImage
                      src={winner?.authorAvatar}
                      alt={winner?.name}
                    />
                    <AvatarFallback>{winner?.name[0]}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <p className="text-xs font-medium text-gray-900 sm:text-sm">
                  {winner?.name}
                </p>
                <motion.div
                  className={`md:w-42 w-28 sm:w-36 lg:w-52 ${heights[winner?.position as keyof typeof heights]} ${
                    positions[winner?.position as keyof typeof positions]
                  } flex flex-col justify-between rounded-t-lg px-2 pt-2 text-center sm:px-4 sm:pt-4`}
                  variants={podiumVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.img
                    src={"Icon.svg"}
                    alt={`${winner?.project} icon`}
                    className="mx-auto h-12 w-12 rounded-full"
                    variants={avatarVariants}
                    initial="initial"
                    animate="animate"
                  />
                  <div className="mb-2">
                    <motion.div
                      className="relative mx-auto mb-2 h-20 w-20"
                      variants={projectImageVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <img
                        src={winner?.projectImage ?? ""}
                        alt={`${winner?.project} preview`}
                        className="rounded-md"
                        width={80}
                        height={80}
                      />
                    </motion.div>
                    <p className="truncate text-xs font-medium text-gray-800 sm:text-sm">
                      {winner?.project}
                    </p>
                    <p className="text-xs text-gray-600">
                      {winner?.votes} votes
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
