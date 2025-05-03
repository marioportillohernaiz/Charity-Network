"use client"

import Link from "next/link"
import { ArrowRightLeft, ArrowUpDown, BarChart4, Headset, History, Loader2, Package, SendHorizonal, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RequestsList from "./requests-list"
import ResourcesList from "./resources-list"
import { AddResources } from "@/components/component/add-resources-dialog"
import OverviewTab from "./overview"
import HistoryTab from "./history"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { RegisterSales } from "@/components/component/register-sales-dialog"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scrollarea"

export default function DashboardPage({charity,charityData,resourceData,allResourcesData,transitData,salesData}:{charity: CharityData; charityData: CharityData[];resourceData: ResourcesData[];allResourcesData: ResourcesData[]; transitData: TransitData[];salesData: Sales[];}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your charity resource assistant. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle sending a message to the chatbot
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: inputMessage.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Format messages for API (exclude the initial greeting)
      const apiMessages = messages.slice(1).concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          charityData: charity,
          resourceData: resourceData,
          availableResources: allResourcesData.filter(resource => resource.charity_id !== charity.id && resource.shareable_quantity > 0)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Sorry, I had trouble responding. Please try again.');
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again or check your connection.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);

    startTransition(() => {
      router.push(path);
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resources Dashboard</h1>
          <p className="text-muted-foreground">Manage and track your charity&apos;s resources</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddResources resource={null} action={"add"} />
          <RegisterSales />
          <div className="hidden md:block h-8 w-px bg-gray-300 mx-1"></div>
          <Button asChild variant="outline" onClick={(e) => handleNavigation(e, "/protected/request-page")}>
            <span>
              {loading && clickedItem === "/protected/request-page" ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : (<ArrowUpDown className="mr-2 h-4 w-4" />) }
              <Link href="/protected/request-page">Request</Link>
            </span>
          </Button>
          <div className="hidden md:block h-8 w-px bg-gray-300 mx-1"></div>
          <Button onClick={() => setIsChatOpen(true)} className="rounded-full w-10 h-10 p-0">
            <Headset className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview" className="text-xs md:text-sm"><BarChart4 className="mr-2 w-4 h-4" />Overview</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs md:text-sm"><Package className="mr-2 w-4 h-4" />Resources</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs md:text-sm"><ArrowRightLeft className="mr-2 w-4 h-4" />Transits</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm"><History className="mr-2 w-4 h-4" />History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab resourceData={resourceData} requestData={transitData} charity={charity} salesData={salesData} />
        </TabsContent>
        <TabsContent value="resources" className="space-y-4">
          <ResourcesList resourceData={resourceData} />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <RequestsList charity={charity} charityData={charityData} resourceData={allResourcesData} transitData={transitData} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <HistoryTab charity={charity} charityData={charityData} resourceData={allResourcesData} transitData={transitData} salesData={salesData} />
        </TabsContent>
      </Tabs>
      
      {/* AI Chatbot Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Headset className="mr-2 h-5 w-5" />
              Charity Resource Assistant
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[350px] pr-4">
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex sm:justify-between">
            <div className="flex w-full gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your question..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isProcessing}
                onClick={handleSendMessage}
                className="rounded-full px-2"
              >
                <SendHorizonal />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster richColors />
    </div>
  )
}