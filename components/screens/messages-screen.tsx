"use client"

import { useState } from "react"
import { Search, Send, ArrowLeft, Phone, MoreVertical, Check, CheckCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  producer: {
    name: string
    avatar?: string
    isOnline: boolean
  }
  lastMessage: string
  timestamp: string
  unread: number
  messages: Message[]
}

interface Message {
  id: string
  text: string
  sender: "user" | "producer"
  timestamp: string
  read: boolean
}

interface MessagesScreenProps {
  conversations: Conversation[]
}

export function MessagesScreen({ conversations }: MessagesScreenProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((c) =>
    c.producer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // In a real app, this would send the message
    setNewMessage("")
  }

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-screen pb-20">
        {/* Chat Header */}
        <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.producer.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {selectedConversation.producer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">{selectedConversation.producer.name}</h2>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.producer.isOnline ? (
                  <span className="text-primary">En ligne</span>
                ) : (
                  "Vu recemment"
                )}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}>
                  <span className={cn(
                    "text-[10px]",
                    message.sender === "user" 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  )}>
                    {message.timestamp}
                  </span>
                  {message.sender === "user" && (
                    message.read ? (
                      <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                    ) : (
                      <Check className="h-3 w-3 text-primary-foreground/70" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="sticky bottom-20 bg-background border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ecrivez un message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-4">
        <h1 className="text-xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <main className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <p className="text-muted-foreground mb-2">Aucune conversation</p>
            <p className="text-sm text-muted-foreground">
              Contactez un producteur pour commencer
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const initials = conversation.producer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.producer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {conversation.producer.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">
                        {conversation.producer.name}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge className="bg-accent text-accent-foreground shrink-0">
                      {conversation.unread}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
