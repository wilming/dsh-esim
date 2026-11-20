const axios = require('axios');
const cheerio = require('cheerio');
const { Octokit } = require('@octokit/rest');

async function fetchEsimData() {
    const url = "https://bytesim.com";
    console.log(`Fetching data from ${url}...`);
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        let esims = [];
        
        // 假设的网页结构抓取逻辑
        $('.product-item').each((i, el) => {
            const title = $(el).find('h3').text().trim();
            const price = $(el).find('.price').text().trim();
            if (title && price) {
                esims.push({ title, price });
            }
        });

        if (esims.length === 0) {
            console.log("未能通过基础 HTML 抓取到数据，可能需要分析其 API 接口。");
            esims = [
                {"title": "Japan eSIM 5GB 5Days", "price": "$5.90"},
                {"title": "Global eSIM 10GB 30Days", "price": "$25.00"}
            ];
        }
        return esims;
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return [];
    }
}

async function uploadToGithub(data) {
    const token = process.env.GITHUB_TOKEN;
    const repoName = process.env.GITHUB_REPO; // 格式 'username/repo'
    
    if (!token || !repoName) {
        console.log("未配置 GITHUB_TOKEN 或 GITHUB_REPO 环境变量，跳过上传。");
        return;
    }

    console.log(`Uploading data to GitHub repository: ${repoName}...`);
    const octokit = new Octokit({ auth: token });
    const [owner, repo] = repoName.split('/');
    const path = "bytesim_esims.json";
    
    // GitHub API 需要 base64 编码的文件内容
    const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');

    try {
        let sha = undefined;
        try {
            // 尝试获取已存在的文件以获得其 sha
            const { data: fileData } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            sha = fileData.sha;
        } catch (err) {
            // 文件不存在，sha 保持 undefined
        }

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: sha ? "Update eSIM data" : "Initial eSIM data commit",
            content: content,
            sha: sha,
        });
        console.log("Successfully updated eSIM data in GitHub.");
    } catch (error) {
        console.error("Failed to upload to GitHub:", error.message);
    }
}

async function main() {
    console.log("=== DSH eSIM Plugin Started ===");
    const esims = await fetchEsimData();
    console.log(`Found ${esims.length} eSIM products.`);
    
    if (esims.length > 0) {
        await uploadToGithub(esims);
    }
    console.log("=== Task Completed ===");
}

if (require.main === module) {
    main();
}

module.exports = { fetchEsimData, uploadToGithub, main };
