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
            }

            const reader = new FileReader();
            
            // 当 FileReader 读取文件完成时
            reader.onload = (e) => {
                
                // --- 这是关键的修复 ---
                // 我们必须等待 <img> 标签也“加载”完这张图片
                originalImage.onload = () => {
                    // 1. 标记图片已准备好
                    uploadedImage = originalImage;
                    
                    // 2. 更新按钮文字和状态
                    uploadLabel.textContent = `已上传: ${file.name}`;
                    generateButton.textContent = '点击生成像素图';
                    generateButton.classList.remove('disabled');
                    generateButton.disabled = false;
                    
                    // 3. 重置下载链接和画布
                    downloadLink.classList.add('disabled'); 
                    canvasContainer.style.display = 'none';
                };
                
                // 把图片数据交给 <img> 标签去加载
                originalImage.src = e.target.result; 
                // --- 修复结束 ---
            };
            
            // 开始读取文件
            reader.readAsDataURL(file);
        }
    });

    // 2. 监听“生成”按钮点击
    generateButton.addEventListener('click', () => {
        if (!uploadedImage) {
            alert('图片尚未准备好，请稍等或重新上传。');
            return;
        }

        // --- 核心像素化逻辑 ---
        // 初始化 pixelit 对象
        const px = new pixelit({
            from: uploadedImage, // 来源是我们的img标签
            to: pixelCanvas      // 目标是我们的canvas标签
        });

        // 调用像素化方法
        px.pixelate({
            blockSize: 8, 
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
