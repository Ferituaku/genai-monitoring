"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, LogIn, Mail } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-slate-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/50 ">
        <div className="flex justify-center">
          <div className="relative w-[240px] h-[80px]">
            <Image
              src="/images/astra-big.png"
              alt="Astra International"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center ">
          <h1 className="text-3xl font-semibold text-slate-700">GEN-AI Mo</h1>
          <p className="text-slate-700 text-sm ">
            Platform monitoring untuk proyek AI generatif Anda
          </p>
        </div>
        <CardContent className="space-y-4 mt-5">
          <Button
            variant="outline"
            className="w-full p-6 bg-blue-200/40 hover:bg-primary/80 duration-700 border-white/10 text-white"
            onClick={() => {}}
          >
            <LogIn className="w-5 h-5 " />
            <span className="text-xl">Masuk</span>
          </Button>
        </CardContent>
        <CardFooter className="text-center text-xs text-slate-700 flex flex-col space-y-2">
          <p>
            Dengan masuk, Anda menyetujui{" "}
            <a href="#" className="underline hover:text-white">
              Syarat dan Ketentuan
            </a>
          </p>
          <p>
            Butuh bantuan?{" "}
            <a href="#" className="underline hover:text-white">
              Hubungi kami
            </a>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
