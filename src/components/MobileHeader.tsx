'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { Sidebar } from './Sidebar'
import { Role } from '@/types'

interface MobileHeaderProps {
    role: Role | null;
}

export function MobileHeader({ role }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <Image src="/logo.svg" alt="SaleTag" width={100} height={28} className="h-7 w-auto" />
            </div>

            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative flex w-64 flex-col bg-slate-900 h-full shadow-xl animate-in slide-in-from-left duration-200">
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <Sidebar
                            role={role}
                            isMobile={true}
                            onLinkClick={() => setIsOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
