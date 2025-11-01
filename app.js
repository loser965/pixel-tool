// 等待文档加载完毕
document.addEventListener('DOMContentLoaded', () => {

    // 获取所有需要的元素
    const imageInput = document.getElementById('imageInput');
    const originalImage = document.getElementById('originalImage');
    const pixelCanvas = document.getElementById('pixelCanvas');
    const generateButton = document.getElementById('generateButton');
    const downloadLink = document.getElementById('downloadLink');
    const canvasContainer = document.querySelector('.canvas-container');
    const uploadLabel = document.querySelector('.upload-label');

    let uploadedImage = null;

    // 1. 监听文件上传
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // 检查大图 - 这是你实现“大图加价”的逻辑点
            if (file.size > 5 * 1024 * 1024) { // 举例：大于5MB
                alert('这是一张大图 (大于5MB)，请购买“大图加价”服务后使用。');
                // 你可以在这里停止处理，或者标记为“大图”
                // 为简化，我们这里先不清空
                // imageInput.value = null; 
                // return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage.src = e.target.result; // 将图片加载到隐藏的img标签
                uploadedImage = originalImage;
                
                uploadLabel.textContent = `已上传: ${file.name}`;
                generateButton.textContent = '点击生成像素图';
                generateButton.classList.remove('disabled');
                generateButton.disabled = false;
                
                downloadLink.classList.add('disabled'); // 重置下载按钮
                canvasContainer.style.display = 'none'; // 隐藏旧画布
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. 监听“生成”按钮点击
    generateButton.addEventListener('click', () => {
        if (!uploadedImage) {
            alert('请先上传一张图片');
            return;
        }

        // --- 核心像素化逻辑 ---
        // 初始化 pixelit 对象
        const px = new pixelit({
            from: uploadedImage, // 来源是我们的img标签
            to: pixelCanvas      // 目标是我们的canvas标签
        });

        // 调用像素化方法
        // 你可以调整这里的参数来改变效果
        px.pixelate({
            // 'blocksize' 决定像素块的大小，数值越大，马赛克越明显
            // 建议范围 5 - 15
            blockSize: 8, 
            
            // 这里可以设置一个调色板（可选）
            // palette: [ [R,G,B], [R,G,B], ... ]
        })
        .draw() // 执行绘制
        .save(); // 保存到canvas

        // --- 逻辑结束 ---

        // 3. 显示结果和下载按钮
        canvasContainer.style.display = 'block'; // 显示画布容器
        
        // 更新下载链接
        downloadLink.href = pixelCanvas.toDataURL('image/png'); // 从canvas获取图片数据
        downloadLink.classList.remove('disabled');
    });

});