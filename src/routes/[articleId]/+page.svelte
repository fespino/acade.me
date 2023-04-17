<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    $: ({ article } = data);
</script>

<form action="?/updateArticle" method="POST">
    <h3>Editing: {article.title}</h3>
    <label for="title">Title</label>
    <input type="text" name="title" placeholder="Title" value={article.title} />
    <label for="content">Content</label>
    <textarea
        name="content"
        placeholder="Content"
        value={article.content}
        rows={5}
    />
    <button type="submit">Update Article</button>
</form>
