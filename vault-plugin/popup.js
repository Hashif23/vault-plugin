// 🔥 Update Status Messages
function updateStatus(message, type) {
    const status = document.getElementById("status");
    status.textContent = message;
    console.log(`[STATUS] ${message}`);

    const styles = {
        success: { color: "#155724", backgroundColor: "#D4EDDA" },
        error: { color: "#721C24", backgroundColor: "#F8D7DA" },
        info: { color: "#004085", backgroundColor: "#CCE5FF" }
    };

    Object.assign(status.style, {
        color: styles[type]?.color || "#004085",
        backgroundColor: styles[type]?.backgroundColor || "#CCE5FF",
        padding: "10px",
        borderRadius: "5px",
        marginTop: "10px",
        textAlign: "center",
        opacity: "1"
    });

    setTimeout(() => { status.style.opacity = "0"; }, 5000);
}

