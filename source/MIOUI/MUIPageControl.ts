
import { UIPageControl } from "./UIPageControl";
import { MUICoreLayerAddStyle, MUICoreLayerRemoveStyle } from "./MIOUI_CoreLayer";

/**
 * Created by godshadow on 31/08/16.
 */

export class MUIPageControl extends UIPageControl {

    setCurrentPage(index){
        super.setCurrentPage(index);

        let currentIndex = 0;
        for (let dotBtn of this.dotButtons){
            if (currentIndex < index) MUICoreLayerAddStyle(dotBtn.layer, "done");
            else MUICoreLayerRemoveStyle (dotBtn.layer, "done");
            currentIndex++;
        }        
    }

}