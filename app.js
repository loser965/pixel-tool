// 使用 "load" 事件，它会等待所有资源（包括 pixelit.js）
// 全部加载完成后，才执行内部代码。
window.addEventListener('load', () => {

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
            if (file.size > 5 * 1024 * 1024) { 
                alert('这是一张大图 (大于5MB)，请购买“大图加价”服务后使用。');
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                originalImage.onload = () => {
                    uploadedImage = originalImage;
                    
                    uploadLabel.textContent = `已上传: ${file.name}`;
                    generateButton.textContent = '点击生成像素图';
                    generateButton.classList.remove('disabled');
                    generateButton.disabled = false;
                    
                    downloadLink.classList.add('disabled'); 
                    canvasContainer.style.display = 'none';
                };
                originalImage.src = e.target.result; 
            };
            
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
        
        // 【最终修复】
        // 我们必须设置 "draw: false"，
        // 否则 pixelit 工具库会“自作聪明”地自动运行 .draw().save()，
        // 这会和我们后面的 .pixelate() 命令“打架”。
        const px = new pixelit({
            from: uploadedImage, 
            to: pixelCanvas,
            draw: false // <--- 这就是我们两天来一直在找的那个 Bug
        });

        // 正确的顺序是：
        // 1. .draw() 先加载数据
        // 2. .pixelate() 再进行像素化
        // 3. .save() 最后保存
        px.draw()
          .pixelate({
            blockSize: 8, 
          })
          .save();

        // --- 逻辑结束 ---

        // 3. 显示结果和下载按钮
        canvasContainer.style.display = 'block'; 
        
        downloadLink.href = pixelCanvas.toDataURL('image/png'); 
        downloadLink.classList.remove('disabled');
    });

});
