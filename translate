let table = base.getTable('XXXXXX');
let resultsField = table.getField('Translate');
let record = await input.recordAsync('Record', table);
let searchQuery = await input.textAsync('Search query');
if (searchQuery) {
    table.updateRecordAsync(record, { [resultsField.id]: 'Updating...' });
    output.markdown(`Searching for ${searchQuery}...`);
    let results = await searchAsync(searchQuery.split(',').map(term => term.trim()).join('\n'));
    await table.updateRecordAsync(record, { [resultsField.id]: results });
    output.markdown(results);
}
async function searchAsync(searchTerm) {
    let response = await fetch(
        `https://api.apify.com/v2/actor-tasks/<TASK ID>/run-sync-get-dataset-items?token=<TOKEN>`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ queries: searchTerm }),
        },
    );
    let result = await response.json();
    let resultLines = [];
    for (let { searchQuery, organicResults } of result) {
        resultLines.push(`## ${searchQuery.term}`);
        for (let { title, url, description } of organicResults) {
            resultLines.push(`- [**${title}**:](${url}) ${description}`);
        }
    }
    return resultLines.join('\n');
}
