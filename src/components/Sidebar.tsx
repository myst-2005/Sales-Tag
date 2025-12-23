
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Megaphone,
    Shield,
    Target,
    LogOut,
    ShieldAlert,
    Menu,
    ChevronLeft,
    Settings
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Role } from '@/types'

interface SidebarProps {
    role: Role | null;
    isMobile?: boolean;
    onLinkClick?: () => void;
}

export function Sidebar({ role, isMobile, onLinkClick }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const links = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['ceo', 'cfo', 'head_of_sales', 'sales_executive', 'data_entry', 'admin', 'project_lead', 'sales_team_lead']
        },
        {
            name: 'Students',
            href: '/dashboard/students',
            icon: Users,
            roles: ['admin', 'sales_executive', 'head_of_sales', 'project_lead', 'sales_team_lead']
        },
        {
            name: 'Payments',
            href: '/dashboard/payments',
            icon: CreditCard,
            roles: ['admin', 'data_entry', 'head_of_sales']
        },
        {
            name: 'Campaigns',
            href: '/dashboard/campaigns',
            icon: Megaphone,
            roles: ['admin', 'head_of_sales', 'sales_executive', 'sales_team_lead']
        },
        {
            name: 'My Executives',
            href: '/dashboard/my-executives',
            icon: Target,
            roles: ['sales_team_lead', 'project_lead', 'head_of_sales']
        },
        {
            name: 'Team',
            href: '/dashboard/team',
            icon: Shield,
            roles: ['admin', 'data_entry']
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
            roles: ['ceo', 'cfo', 'head_of_sales', 'sales_executive', 'data_entry', 'admin', 'project_lead', 'sales_team_lead']
        }
    ]

    return (
        <div
            className={cn(
                "flex h-full flex-col bg-slate-900 text-white transition-all duration-300 relative",
                isCollapsed ? "w-20" : "w-64",
                isMobile && "w-64" // Force full width on mobile
            )}
        >
            <div className={cn("flex h-16 items-center font-bold text-xl tracking-tight transition-all", isCollapsed ? "justify-center px-0" : "px-6")}>
                {isCollapsed ? (
                    <span className="text-blue-600 font-bold text-2xl">S.</span>
                ) : (
                    <Image src="/logo-white.svg" alt="SaleTag" width={120} height={32} className="h-8 w-auto" />
                )}
            </div>

            {!isMobile && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-6 bg-blue-600 text-white p-1 rounded-full border-4 border-slate-50 hover:bg-blue-700 transition-colors z-20"
                >
                    {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}

            <div className="flex-1 px-4 py-4 space-y-1 overflow-x-hidden">
                {links.map((link) => {
                    if (!role || !link.roles.includes(role)) return null;

                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                                isCollapsed && !isMobile && "justify-center px-2"
                            )}
                            title={isCollapsed ? link.name : undefined}
                        >
                            <link.icon className="h-5 w-5 min-w-[20px]" />
                            {(!isCollapsed || isMobile) && <span>{link.name}</span>}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-slate-800 overflow-hidden">
                {!isCollapsed || isMobile ? (
                    <div className="flex items-center gap-3 px-4 py-2 text-slate-400 text-sm whitespace-nowrap">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="capitalize">{role?.replace('_', ' ') || 'Guest'}</span>
                    </div>
                ) : (
                    <div className="flex justify-center py-2 text-slate-400">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                )}

                <button
                    onClick={handleSignOut}
                    className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors mt-2 whitespace-nowrap",
                        isCollapsed && !isMobile && "justify-center px-2"
                    )}
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5 min-w-[20px]" />
                    {(!isCollapsed || isMobile) && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    )
}
