export const send = async (name, value) => {
    // 构建带查询参数的 URL，使用 encodeURIComponent 进行 URI 转义
    const encodedKey = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    const url = `https://textdb.online/update/?key=${encodedKey}&value=${encodedValue}`;

    const response = await fetch(url, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}