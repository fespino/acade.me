<script lang="ts">
    import ChatMessage from "$lib/components/ChatMessage.svelte";
    import type { ChatCompletionRequestMessage } from "openai";
    import { SSE } from "sse.js";

    let query: string = "";
    let answer: string = "";
    let loading: boolean = false;
    let chatMessages: ChatCompletionRequestMessage[] = [];
    let scrollToDiv: HTMLDivElement;

    function scrollToBottom() {
        setTimeout(() => {
            scrollToDiv.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }

    const handleSubmit = async () => {
        loading = true;
        chatMessages = [
            ...chatMessages,
            {
                role: "user",
                content: query,
            },
        ];

        const eventSource = new SSE("/api/chat", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: chatMessages,
            }),
        });

        query = "";
        eventSource.addEventListener("error", handleError);
        eventSource.addEventListener("message", (e) => {
            scrollToBottom();
            try {
                loading = false;
                if (e.data == "[DONE]") {
                    chatMessages = [
                        ...chatMessages,
                        {
                            role: "assistant",
                            content: answer,
                        },
                    ];
                }

                const completionResponse = JSON.parse(e.data);
                const [{ delta }] = completionResponse.choices;
                if (delta.content) {
                    answer += (answer ?? "") + delta.content;
                }
            } catch (err) {
                handleError(err);
            }
        });
        eventSource.stream();
        scrollToBottom();
    };

    function handleError<T>(err: T) {
        console.error(err);
        loading = false;
        query = "";
        answer = "";
    }
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
    <div>
        <h1 class="text-2xl font-bold w-full text-center">Chatty</h1>
        <p class="text-sm italic">Powered by gpt-3.5-turbo</p>
    </div>
    <div
        class="h-[500px] w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4"
    >
        <div class="flex flex-col gap-2">
            <ChatMessage
                type="assistant"
                message="Hello, ask me anything you want"
            />
            {#each chatMessages as message}
                <ChatMessage type={message.role} message={message.content} />
            {/each}
            {#if answer}
                <ChatMessage type="assistant" message={answer} />
            {/if}
            {#if loading}
                <ChatMessage type="assistant" message="Thinking..." />
            {/if}
        </div>
        <div class="" />
    </div>
    <form on:submit|preventDefault={() => handleSubmit()}>
        <input type="text" bind:value={query} />
        <button type="submit">Submit</button>
    </form>
</div>
