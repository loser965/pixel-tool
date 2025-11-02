// 【修复】
// 不再使用 "DOMContentLoaded"，因为它不等脚本加载
// 我们使用 "load" 事件，它会等待所有资源（包括 pixelit.js）
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
        // 现在，当这段代码运行时，"pixelit" 肯定是已经加载好的
        const px = new pixelit({
            from: uploadedImage, 
            to: pixelCanvas      
        });

        // 调用像素化方法
        px.pixelate({
            blockSize: 8, 
        })
        .draw() 
        .save(); 

        // --- 逻辑结束 ---

        // 3. 显示结果和下载按钮
        canvasContainer.style.display = 'block'; 
        
        downloadLink.href = pixelCanvas.toDataURL('image/png'); 
        downloadLink.classList.remove('disabled');
    });

}); // 【修复】对应开头的 window.addEventListener
