import { OPENAI_API_KEY } from '$env/static/private'
import { countTokens } from '$lib/tokenizer';
import { json, type RequestHandler } from "@sveltejs/kit";
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from 'openai';

const MAX_TOKENS = 4096

export const POST: RequestHandler = async ({ request }) => {
    try {
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY env variable not set')
        }

        const requestData = await request.json()

        if (!requestData) {
            throw new Error('No request data')
        }

        const reqMessages: ChatCompletionRequestMessage[] = requestData.messages
        if (!reqMessages) {
            throw new Error('No messages')
        }

        let tokenCount = 0
        reqMessages.forEach(message => {
            tokenCount += countTokens(message.content)
        })

        const moderationResponse = await fetch('https://api.openai.com/v1/moderation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                input: reqMessages[reqMessages.length - 1].content,

            })
        });

        const moderationData = await moderationResponse.json()
        const [results] = moderationData.data

        if (results.flagged) {
            throw new Error('Message flagged by OpenAI')
        }

        const prompt = 'You are a virtual assistant working for acade.me. Your name is Latest.'
        tokenCount += countTokens(prompt)

        if (tokenCount >= MAX_TOKENS) {
            throw new Error('Message too long')
        }

        const messages: ChatCompletionRequestMessage[] = [
            { role: 'system', content: prompt },
            ...reqMessages
        ]

        const chatRequestOpts: CreateChatCompletionRequest = {
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.9,
            stream: true
        }

        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(chatRequestOpts)
        });

        if (!chatResponse.ok) {
            throw new Error('OpenAI API error')
        }

        return new Response(chatResponse.body, {
            headers: {
                'Content-Type': 'text/event-stream'
            }
        })
    } catch (error) {
        console.log(error)
        return json({ error: 'There was an error processing your request' }, { status: 500 })
    }



}