"use client";
import { supa } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/UI";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supa.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/boards");
    });
  }, [router]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <div className="grid gap-3">
          <h2 className="text-lg font-semibold">Sign in</h2>
          <p className="text-sm text-gray-600">We’ll email you a magic link.</p>

          <Input
            type="email"
            autoComplete="email"
            className="w-full"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            variant="primary"
            className="w-full"
            onClick={async () => {
              if (!email) return;
              await supa.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/` },
              });
              setSent(true);
            }}
          >
            Send magic link
          </Button>

          {sent && <p className="text-xs text-green-600">Check your inbox.</p>}
        </div>
      </Card>
    </div>
  );
}
