"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { login } from "@/lib/actions/auth"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await login(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // If success, redirect happens in server action
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
                        Accedi
                    </h2>
                    <p className="mt-2 text-center text-sm text-neutral-600">
                        Gestionale Clienti & Fatturati
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="group relative flex w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? "Accesso in corso..." : "Accedi"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
