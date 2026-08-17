"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { DsExample } from "@/components/ds/ds-section"

const scrollerMessages = [
  "Welcome to the PDM Resource Hub chat.",
  "Has anyone tried the estimation drills yet?",
  "Yes! They're a great warm-up before mock interviews.",
  "Where can I find the growth metrics cheat sheet?",
  "It's linked under the Growth PM track.",
  "Thanks, checking it out now.",
  "Good luck with your interviews everyone!",
  "Appreciate it, same to you.",
]

function ChatSection() {
  return (
    <>
      <DsExample
        title="Message & Bubble"
        description="Chat-style message rows with avatars and bubbles."
        contentClassName="flex-col items-stretch"
      >
        <MessageGroup className="max-w-md">
          <Message align="start">
            <MessageAvatar>
              <Avatar size="sm">
                <AvatarFallback>PM</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Mentor</MessageHeader>
              <Bubble variant="muted">
                <BubbleContent>
                  How is your case interview prep going?
                </BubbleContent>
              </Bubble>
              <Bubble variant="tinted">
                <BubbleContent>Loved the estimation drills!</BubbleContent>
                <BubbleReactions>👍 2</BubbleReactions>
              </Bubble>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageContent>
              <Bubble align="end">
                <BubbleContent>
                  Good, just finished the estimation drills.
                </BubbleContent>
              </Bubble>
              <MessageFooter>Sent just now</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </DsExample>

      <DsExample
        title="Message Scroller"
        description="An auto-scrolling viewport for chat-style content."
        contentClassName="p-0"
      >
        <MessageScrollerProvider>
          <MessageScroller className="h-56 w-full max-w-md rounded-2xl border">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {scrollerMessages.map((text, index) => (
                  <MessageScrollerItem
                    key={text}
                    scrollAnchor={index === scrollerMessages.length - 1}
                  >
                    <p className="px-4 py-1.5 text-sm text-muted-foreground">
                      {text}
                    </p>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end" />
          </MessageScroller>
        </MessageScrollerProvider>
      </DsExample>
    </>
  )
}

export { ChatSection }
