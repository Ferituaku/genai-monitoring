"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle Google OAuth callback
  useEffect(() => {
    // Get token from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Save token and redirect
      localStorage.setItem("token", token);
      router.push("/dashboard");
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Redirect ke endpoint Google login
      window.location.href = `${API_BASE_URL}/login/google`;
    } catch (err) {
      setError("Terjadi kesalahan saat login dengan Google");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-slate-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/50">
        <div className="flex justify-center">
          <div className="relative w-[240px] h-[80px]">
            <Image
              src="/openai/ai-monitor/images/astra-logo.png"
              alt="Astra International"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-700">
            GEN AI Monitoring
          </h1>
          <p className="text-slate-700 font-light text-sm">
            Platform monitoring untuk proyek AI generatif Anda
          </p>
        </div>

        <CardContent className="space-y-4 mt-5">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full p-6 bg-blue-200/40 hover:bg-primary/80 duration-700 border-white/10 text-white"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <LogIn className="w-5 h-5 mr-2" />
            <span className="text-xl">{loading ? "Loading..." : "Masuk"}</span>
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
