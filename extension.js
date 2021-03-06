var vscode = require('vscode');
var os = require('os');
var config = vscode.workspace.getConfiguration('phpserver');
var browser = config.get("browser");
var relativeurl = config.get("relativeurl");
var port = config.get("port");
var external = config.get("external");
var platform = os.platform();
switch (browser) {
    case "firefox":
     if (platform == 'linux' || platform == 'darwin') {
            browser = browser+" http:/localhost:"+port;
        }else if (platform == 'win32') {
            browser= "start "+browser+" http:/localhost:"+port;
        }
        break;
    case "chrome":
        if (platform == 'linux' || platform == 'darwin') {
            browser = "google-chrome http:/localhost:"+port;
        } else if (platform == 'win32') {
            browser= "start "+browser+" http:/localhost:"+port;
        }
        break;
}
var serverterminal;
var browserterminal;
function activate(context) {
    var out = vscode.window.createOutputChannel("PHP Server");
    context.subscriptions.push(vscode.commands.registerCommand('extension.serveProject', function () {
        if (serverterminal) {
            vscode.window.showErrorMessage('Server already running!');
            return;
        }
        out.clear();
        out.show();
        var args = ['-S', 'localhost:' + port];

        if (external) {
            args = ['-S', '0.0.0.0:' + port];
        }

        if (relativeurl != "") {
            args.push("-t");
            args.push(relativeurl);
        }
        serverterminal = require('child_process').spawn('php', args, { cwd: vscode.workspace.rootPath });
        serverterminal.stdout.on('data', function(data) {
            out.appendLine(data.toString());
        });
        serverterminal.stderr.on('data', function(data){
            out.appendLine(data.toString());
        });
        serverterminal.on('close', function(code){
            vscode.window.showInformationMessage('Server Stopped');
            out.hide();
        });
        vscode.window.showInformationMessage('Serving Project');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', function () {
        deactivate();
    }));
    if (browser != "") {
        browserterminal=require('child_process').exec(browser);
    }
}
exports.activate = activate;
function deactivate() {
    if (serverterminal) {
        serverterminal.kill();
        serverterminal = undefined;
    }
}
exports.deactivate = deactivate;