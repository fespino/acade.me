<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    $: ({ articles } = data);
</script>

<h1 class="text-3xl font-bold underline">Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<div class="grid grid-cols-2">
    <div>
        <h2 class="text-2xl font-bold underline">Articles</h2>
        {#each articles as article}
            <div class="border border-gray-200 rounded p-4 mb-4">
                <h3 class="text-xl font-bold">{article.title}</h3>
                <p>{article.content}</p>
                <a href="/{article.id}">Edit article</a>
                <form action="?/deleteArticle&id={article.id}" method="POST">
                    <button type="submit">Delete article</button>
                </form>
            </div>
        {/each}
    </div>

    <div>
        <form action="?/createArticle" method="POST">
            <label for="title">Title</label>
            <input type="text" name="title" placeholder="Title" />
            <label for="content">Content</label>
            <textarea name="content" placeholder="Content" rows={5} />
            <button type="submit">Create Article</button>
        </form>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.gray.100);
    }
</style>
