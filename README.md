# dsh-esim

这是一个定制的 DSH 插件项目，主要功能是去 [ByteSIM](https://bytesim.com/) 寻找合适的 eSIM 套餐，并将结果自动上传到指定的 GitHub 仓库中。

## 功能特性

1. **数据抓取**: 自动访问 ByteSIM 网站并获取 eSIM 产品的相关信息（如套餐名称、价格等）。
2. **数据处理**: 将抓取到的信息格式化为结构化的 JSON 数据。
3. **GitHub 同步**: 利用 GitHub API 将最新的数据文件自动推送到你的仓库中。

## 依赖安装

请确保你已经安装了 Python (推荐 3.7+)，然后在项目根目录下运行：

```bash
pip install -r requirements.txt
```

## 配置环境变量

在运行脚本将数据上传到 GitHub 之前，你需要设置以下环境变量：

- `GITHUB_TOKEN`: 你的 GitHub 个人访问令牌（Personal Access Token），需包含 `repo` 权限以读写仓库。
- `GITHUB_REPO`: 你要上传数据的目标仓库地址，格式为 `用户名/仓库名`，例如 `myuser/my-esim-data`。

### Windows 设置示例 (PowerShell)
```powershell
$env:GITHUB_TOKEN="你的_github_token"
$env:GITHUB_REPO="username/repo_name"
```

## 运行插件

```bash
python main.py
```

## 注意事项

- `main.py` 中的 HTML 解析规则是示例性质的，如果 ByteSIM 的网页结构或者接口发生变化（例如采用了动态渲染或更换了 API），需要相应调整 `fetch_esim_data` 函数中的解析逻辑。
