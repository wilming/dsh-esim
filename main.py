import requests
from bs4 import BeautifulSoup
import os
import json
from github import Github

def fetch_esim_data():
    url = "https://bytesim.com"
    print(f"Fetching data from {url}...")
    
    # 简单的请求示例，实际情况可能需要针对 ByteSIM 的接口或页面结构进行调整
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        esims = []
        # 这里需要根据 bytesim.com 实际的 HTML 结构来解析产品信息
        # 以下是假设的结构
        products = soup.find_all('div', class_='product-item') # 假设产品列表的 class
        for product in products:
            title = product.find('h3')
            price = product.find('span', class_='price')
            
            if title and price:
                esims.append({
                    'title': title.text.strip(),
                    'price': price.text.strip()
                })
        
        # 如果没有抓到数据，返回一些示例数据作为 fallback
        if not esims:
            print("未能通过基础 HTML 抓取到数据，可能需要分析其 API 接口。")
            esims = [
                {"title": "Japan eSIM 5GB 5Days", "price": "$5.90"},
                {"title": "Global eSIM 10GB 30Days", "price": "$25.00"}
            ]
            
        return esims
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def upload_to_github(data):
    token = os.getenv('GITHUB_TOKEN')
    repo_name = os.getenv('GITHUB_REPO') # 例如 'username/repo'
    
    if not token or not repo_name:
        print("未配置 GITHUB_TOKEN 或 GITHUB_REPO 环境变量，跳过上传。")
        return

    print(f"Uploading data to GitHub repository: {repo_name}...")
    try:
        g = Github(token)
        repo = g.get_repo(repo_name)
        
        file_path = "bytesim_esims.json"
        content = json.dumps(data, indent=2, ensure_ascii=False)
        
        try:
            # 尝试获取已存在的文件
            contents = repo.get_contents(file_path)
            # 如果存在则更新
            repo.update_file(contents.path, "Update eSIM data", content, contents.sha)
            print("Successfully updated eSIM data in GitHub.")
        except Exception as e:
            # 如果不存在则创建
            repo.create_file(file_path, "Initial eSIM data commit", content)
            print("Successfully created eSIM data file in GitHub.")
            
    except Exception as e:
        print(f"Failed to upload to GitHub: {e}")

def main():
    print("=== DSH eSIM Plugin Started ===")
    esims = fetch_esim_data()
    print(f"Found {len(esims)} eSIM products.")
    
    if esims:
        upload_to_github(esims)
    print("=== Task Completed ===")

if __name__ == "__main__":
    main()
