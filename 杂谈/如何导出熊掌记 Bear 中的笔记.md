# 如何导出熊掌记 Bear 中的笔记

熊掌记 Bear 是一款 macOS 下基于 Markdown 的笔记软件，颜值很高，很轻量。

但是最近熊掌记 Bear 会员到期，续费时发现会员价格涨价了，所以想看一下如何批量将熊掌记 Bear 中的笔记和附件全部导出。探究实践一番，发现还是可行的。

下面就来看看，无需会员，一键将所有熊掌记笔记和附件导出。

## Bear 中的笔记存储在哪里

根据官方文档 [熊掌记的笔记储存在哪里](https://bear.app/zh/faq/where-are-bears-notes-located/)，Bear 的笔记存储在 `~/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/` 文件夹，查看此文件夹，包含 sqlite 数据库文件和 Local Files 文件夹。

- sqlite 数据库中有笔记、密码、标签等数据库表；
- Local Files 文件夹下有笔记的图片和文件等附件；

## 读取数据库

使用 Python 中的 sqlite3 读取数据库。

ZSFNOTE 是保存笔记的表，这个表中有以下关键字段：
- ZTITLE：标题
- ZSUBTITLE：子标题
- ZTEXT：笔记内容
- ZCREATIONDATE：创建时间
- ZMODIFICATIONDATE：修改时间
- ZTRASHED：是否在废纸篓
- ZTRASHEDDATE：放进废纸篓时间

```python
import sqlite3 as db
def read_sqlite(db_path, exectCmd):
    conn = db.connect(db_path)
    cursor = conn.cursor()
    conn.row_factory = db.Row
    cursor.execute(exectCmd)
    rows = cursor.fetchall()
    return rows

notes = read_sqlite(
        sqlite_file, "SELECT ZTITLE, ZSUBTITLE, ZTEXT, ZCREATIONDATE, ZMODIFICATIONDATE, ZTRASHED, ZTRASHEDDATE FROM " + note_table_name + ";")

for note in notes:
    title = note[0]
    content = note[2]
    is_trashed = note[5]

    print("笔记：" + title + "，是否在废纸篓：" + str(is_trashed == 1))
```

在此就找到了笔记内容，我们可以直接将 content 内容保存到文件中，以 .md 结尾即可得到笔记的内容。

除此之外，还有笔记中的图片和文件需要找到，不然我们无法查看这些图片和文件。

## 查找并复制笔记的附件

笔记的附件保存在上面提到的 Local Files 文件夹下，这些文件的文件名和笔记中引用的文件是一致的。

笔记中引入附件通常采用 `![这是一个图片](path/to/pic.png)` 的形式，所以我们可以对笔记内容使用正则表达式 `r'\[.*\]\(.*\)'` 来进行匹配，得到所有附件。

然后用匹配到的附件文件名，去和 Local Files 文件夹下的文件做匹配即可找到对应文件，复制到我们需要的文件夹下，然后将笔记原引用地址替换为新地址即可。

```python
for note in notes:
    title = note[0]
    content = note[2]
    is_trashed = note[5]

    print("笔记：" + title + "，是否在废纸篓：" + str(is_trashed == 1))

    matches = re.findall(file_pattern, content)
    for match in matches:
        left_index = match.index("(") + 1
        file_name = match[left_index:-1]
        for file in all_files:
            if file_name in file:
                shutil.copy(file, resource_total_dir + file_name)
                content = content.replace(file_name, resource_dir + file_name)
                break

    save_to_file(bear_total_dir + title + ".md", content)
```

这样我们就将熊掌记 Bear 中的笔记和附件全部保存为 Markdown 格式了，你可以在 Github 的 [note_exporter](https://github.com/QinGeneral/note_exporter?tab=readme-ov-file) 中找到完整的代码。