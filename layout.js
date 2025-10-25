
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Coins, LayoutDashboard, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import * as base44 from "@/api/base44"; // Assuming base44 is an API client or similar utility

const navigationItems = [
  {
    title: "Mint",
    url: createPageUrl("Mint"),
    icon: Coins,
  },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [stats, setStats] = React.useState({ nftMinted: 0, tokensMinted: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock base44.entities.MintTransaction.list for demonstration if actual API is not present
        // In a real application, base44 would be a properly configured API client.
        const mockTransactions = [
          { id: '1', status: 'completed', mint_type: 'nft', nft_minted: true, tokens_received: 50000 },
          { id: '2', status: 'completed', mint_type: 'token', nft_minted: false, tokens_received: 5000 },
          { id: '3', status: 'pending', mint_type: 'nft', nft_minted: false, tokens_received: 0 },
          { id: '4', status: 'completed', mint_type: 'nft', nft_minted: true, tokens_received: 50000 },
          { id: '5', status: 'completed', mint_type: 'token', nft_minted: false, tokens_received: 5000 },
          { id: '6', status: 'completed', mint_type: 'nft', nft_minted: true, tokens_received: 50000 },
        ];
        
        const transactions = base44.entities && base44.entities.MintTransaction ? await base44.entities.MintTransaction.list() : mockTransactions;
        
        const completed = transactions.filter(t => t.status === 'completed');
        const nftMinted = completed.filter(t => t.mint_type === 'nft' && t.nft_minted).length;
        const tokensMinted = completed.reduce((sum, t) => sum + (t.tokens_received || 0), 0);
        setStats({ nftMinted, tokensMinted });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Optionally set default/error state for stats here
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950">
        <Sidebar className="border-r border-gray-800 bg-gray-950">
          <SidebarHeader className="border-b border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">$COLLECT</h2>
                <p className="text-xs text-gray-400">NFT Mint Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-800 hover:text-purple-400 transition-colors duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-gray-800 text-purple-400' : 'text-gray-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-2">
                Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">NFTs Minted</span>
                    <span className="ml-auto font-semibold text-white">{stats.nftMinted} / 10,000</span>
                  </div>
                  <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                      style={{width: `${(stats.nftMinted / 10000) * 100}%`}}
                    ></div>
                  </div>
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">Total Tokens</span>
                    </div>
                    <p className="text-lg font-bold text-blue-400 mt-1">
                      {(stats.tokensMinted / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-500">$COLLECT minted</p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-800 p-4 space-y-2">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-300 font-medium mb-1">NFT Mint</p>
              <p className="text-sm text-white font-bold">10 USDC = 50K $COLLECT</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-gray-300 font-medium mb-1">Token Mint</p>
              <p className="text-sm text-white font-bold">1 USDC = 5K $COLLECT</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-gray-950 border-b border-gray-800 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200 text-white" />
              <h1 className="text-xl font-semibold text-white">$COLLECT</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-gray-950">
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        :root {
          --background: 220 13% 5%;
          --foreground: 210 40% 98%;
          --primary: 263 70% 50%;
          --primary-foreground: 210 40% 98%;
        }
      `}</style>
    </SidebarProvider>
  );
}
