'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function RoleSelector() {
    const [role, setRole] = useState("patient")

    return (
        <Tabs value={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
            <input type="hidden" name="role" value={role} />
        </Tabs>
    )
}
